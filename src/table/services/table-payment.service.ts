import {
  ActivityAction,
  OrderDetailStatus,
  OrderStatus,
  OrderType,
  PaymentMethodType,
  PaymentStatus,
  PrismaClient
} from '@prisma/client'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PaymentFromTableDto } from 'src/order/dto/payment.dto'
import {
  generateCode,
  getCustomerDiscount,
  getDiscountCode,
  getOrderDetailsInTable,
  getOrderTotal,
  getVoucher,
  handleOrderDetailsBeforePayment
} from 'utils/Helps'
import { orderSelect } from 'responses/order.response'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { TableGatewayHandler } from 'src/gateway/handlers/table.handler'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'
import { TableOrderService } from './table-order.service'

@Injectable()
export class TablePaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly tableGatewayHandler: TableGatewayHandler,
    private readonly orderGatewayHandler: OrderGatewayHandler,
    private readonly tableOrderService: TableOrderService
  ) {}

  async payment(
    tableId: string,
    data: PaymentFromTableDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return await this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        const [paymentMethod, branchSetting] = await Promise.all([
          prisma.paymentMethod.findUniqueOrThrow({
            where: {
              id: data.paymentMethodId
            }
          }),
          prisma.branchSetting.findUniqueOrThrow({
            where: {
              branchId
            }
          }),
          handleOrderDetailsBeforePayment(prisma, { tableId: tableId, branchId })
        ])

        // Kiểm tra xem có setting sử dụng bếp hay không
        if (!branchSetting.useKitchen)
          await prisma.orderDetail.updateMany({
            where: { tableId, branchId },
            data: {
              status: OrderDetailStatus.SUCCESS,
              successAt: new Date()
            }
          })

        if (paymentMethod.type === PaymentMethodType.VNPAY) {
          throw new HttpException('Không thể chọn phương thức này!', HttpStatus.CONFLICT)
        }

        // Cập nhật món amount = 0 to SUCCESS và lấy orderDetails cùng lúc
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, orderDetailsInTable] = await Promise.all([
          handleOrderDetailsBeforePayment(prisma, { tableId, branchId }),
          getOrderDetailsInTable(tableId, prisma)
        ])

        const orderTotalNotDiscount = getOrderTotal(orderDetailsInTable)

        const voucherParams = {
          voucherId: data.voucherId,
          branchId,
          orderDetails: orderDetailsInTable,
          voucherCheckRequest: {
            orderTotal: orderTotalNotDiscount,
            totalPeople: data.totalPeople
          }
        }

        // Lấy thông tin giảm giá
        const [voucher, discountCodeValue, customerDiscountValue] = await Promise.all([
          getVoucher(voucherParams, prisma),
          getDiscountCode(data.discountCode, orderTotalNotDiscount, branchId, prisma),
          getCustomerDiscount(data.customerId, orderTotalNotDiscount, prisma)
        ])

        const orderTotal =
          orderTotalNotDiscount -
          (voucher.voucherValue || 0) -
          discountCodeValue -
          customerDiscountValue

        // Thanh toán với tiền mặt | chuyển khoản
        if (
          paymentMethod.type === PaymentMethodType.CASH ||
          paymentMethod.type === PaymentMethodType.BANKING
        ) {
          if (orderTotal > data.moneyReceived)
            throw new HttpException('Tiền nhận không hợp lệ!', HttpStatus.CONFLICT)

          const createOrderPromise = prisma.order.create({
            data: {
              isDraft: false,
              paymentStatus: PaymentStatus.SUCCESS,
              tableId,
              orderTotal,
              code: data.code || generateCode('DH', 15),
              note: data.note,
              type: OrderType.OFFLINE,
              status: data.status || OrderStatus.SUCCESS,
              discountCodeValue,
              voucherValue: voucher.voucherValue,
              voucherProducts: voucher.voucherProducts,
              customerDiscountValue,
              bankingImages: data.bankingImages,
              moneyReceived: data.moneyReceived,
              paymentAt: new Date(),
              paymentMethodId: data.paymentMethodId,
              createdBy: accountId,
              branchId,
              ...(data.customerId && { customerId: data.customerId })
            },
            select: orderSelect
          })

          // Gán chi tiết đơn hàng
          const passOrderDetailPromise = createOrderPromise.then(order => {
            return this.tableOrderService.passOrderDetailToOrder(
              orderDetailsInTable,
              order.id,
              accountId,
              prisma
            )
          })

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [newOrder, _] = await Promise.all([createOrderPromise, passOrderDetailPromise])

          // Clear table
          const newTable = { ...newOrder.table, orderDetails: [] }

          // Đơn hàng chi tiết (món mới chuyển từ bàn)
          const fullOrder = {
            ...newOrder,
            orderDetails: orderDetailsInTable,
            table: newTable
          }

          // Gửi socket, lưu log
          await Promise.all([
            this.activityLogService.create(
              {
                action: ActivityAction.PAYMENT,
                modelName: 'Order',
                targetName: fullOrder.code,
                targetId: fullOrder.id
              },
              { branchId },
              accountId
            ),
            this.orderGatewayHandler.handleCreateOrder(fullOrder, branchId, deviceId),
            this.tableGatewayHandler.handleUpdateTable(newTable, branchId, deviceId)
          ])

          return fullOrder
        }
      },
      {
        timeout: 10_000,
        maxWait: 15_000
      }
    )
  }
}
