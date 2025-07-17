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
  getOrderDetailsInTable,
  getOrderTotal,
  handleOrderDetailsBeforePayment
} from 'helpers'
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
    // 1. Lấy thông tin phương thức thanh toán và setting chi nhánh
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [paymentMethod, branchSetting, taxSetting] = await Promise.all([
      this.prisma.paymentMethod.findUniqueOrThrow({
        where: { id: data.paymentMethodId }
      }),
      this.prisma.branchSetting.findUniqueOrThrow({
        where: { branchId }
      }),
      this.prisma.taxSetting.findUnique({
        where: { branchId }
      })
    ])

    const newOrder = await this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        // 2. Validate phương thức thanh toán
        if (paymentMethod.type === PaymentMethodType.VNPAY) {
          throw new HttpException('Không thể chọn phương thức này!', HttpStatus.CONFLICT)
        }

        // 3. Xử lý trạng thái món khi không sử dụng bếp
        if (!branchSetting.useKitchen) {
          await prisma.orderDetail.updateMany({
            where: { tableId, branchId },
            data: {
              status: OrderDetailStatus.SUCCESS,
              successAt: new Date()
            }
          })
        }

        // 4. Lấy chi tiết món và tính tổng tiền
        const [, orderDetailsInTable] = await Promise.all([
          handleOrderDetailsBeforePayment(prisma, { tableId, branchId }),
          getOrderDetailsInTable(tableId, prisma)
        ])

        const orderTotalNotDiscount = getOrderTotal(orderDetailsInTable)
        const customerDiscountValue = await getCustomerDiscount(
          data.customerId,
          orderTotalNotDiscount,
          prisma
        )
        const orderTotal = orderTotalNotDiscount - customerDiscountValue

        if (taxSetting && taxSetting.vatMethod) {
        }

        // 5. Xử lý thanh toán tiền mặt hoặc chuyển khoản
        if (
          paymentMethod.type === PaymentMethodType.CASH ||
          paymentMethod.type === PaymentMethodType.BANKING
        ) {
          // Validate số tiền nhận
          if (orderTotal > data.moneyReceived) {
            throw new HttpException('Tiền nhận không hợp lệ!', HttpStatus.CONFLICT)
          }

          // Tạo đơn hàng
          const createOrderPromise = prisma.order.create({
            data: {
              isDraft: false,
              paymentStatus: PaymentStatus.SUCCESS,
              tableId,
              orderTotal,
              code: generateCode('DH', 15),
              note: data.note,
              type: OrderType.OFFLINE,
              status: OrderStatus.SUCCESS,
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

          // Thực thi tạo order và chuyển chi tiết đơn hàng từ bàn sang đơn
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [newOrder, _] = await Promise.all([createOrderPromise, passOrderDetailPromise])

          // Xây dựng response
          const updatedTable = { ...newOrder.table, orderDetails: [] }

          return {
            ...newOrder,
            orderDetails: orderDetailsInTable,
            table: updatedTable
          }
        }
      },
      {
        timeout: 10_000,
        maxWait: 15_000
      }
    )

    // Gửi socket và lưu log
    await Promise.all([
      this.activityLogService.create(
        {
          action: ActivityAction.PAYMENT,
          modelName: 'Order',
          targetName: newOrder.code,
          targetId: newOrder.id
        },
        { branchId },
        accountId
      ),
      this.orderGatewayHandler.handleCreateOrder(newOrder, branchId, deviceId),
      this.tableGatewayHandler.handleUpdateTable(newOrder.table, branchId, deviceId)
    ])

    return newOrder
  }
}
