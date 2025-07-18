import {
  ActivityAction,
  OrderDetailStatus,
  OrderType,
  PaymentMethodType,
  PaymentStatus,
  PrismaClient,
  TaxApplyMode
} from '@prisma/client'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PaymentFromTableDto } from 'src/order/dto/payment.dto'
import {
  generateCode,
  getOrderDetailsInTable,
  getOrderTotal,
  handleOrderDetailsBeforePayment
} from 'helpers'
import { orderSelect } from 'responses/order.response'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { TableGatewayHandler } from 'src/gateway/handlers/table.handler'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'
import { TableOrderService } from './table-order.service'
import { calculateTax } from 'helpers/tax.helper'
import { MAX_WAIT, TIMEOUT } from 'enums/common.enum'

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
    // Lấy thông tin phương thức thanh toán và setting chi nhánh
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id: branchId },
      select: {
        branchSetting: true,
        taxSetting: true,
        paymentMethods: {
          where: {
            id: data.paymentMethodId
          }
        }
      }
    })

    const { branchSetting, taxSetting } = branch
    const paymentMethod = branch.paymentMethods[0]

    let totalTax = 0
    let totalTaxDiscount = 0

    // Validate phương thức thanh toán
    if (paymentMethod.type === PaymentMethodType.VNPAY) {
      throw new HttpException('Không thể chọn phương thức này!', HttpStatus.CONFLICT)
    }

    const newOrder = await this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        // Xử lý trạng thái món khi không sử dụng bếp
        if (!branchSetting.useKitchen) {
          await prisma.orderDetail.updateMany({
            where: { tableId, branchId },
            data: {
              status: OrderDetailStatus.SUCCESS,
              successAt: new Date()
            }
          })
        }

        // Lấy chi tiết món và tính tổng tiền
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, orderDetailsInTable] = await Promise.all([
          handleOrderDetailsBeforePayment(prisma, { tableId, branchId }),
          getOrderDetailsInTable(tableId, prisma)
        ])

        const orderTotalNotDiscount = getOrderTotal(orderDetailsInTable)

        if (orderTotalNotDiscount < data.discountValue)
          throw new HttpException('Giá trị giảm giá không hợp lệ!', HttpStatus.BAD_REQUEST)

        // Tính tổng tiền sau giảm giá theo khách
        const orderTotalWithDiscount = orderTotalNotDiscount - data.discountValue

        // Tính thuế nếu có
        if (data.isTaxApplied && !taxSetting && !taxSetting?.isActive)
          throw new HttpException('Thuế chưa được cài đặt!', HttpStatus.BAD_REQUEST)
        else {
          if (data.isTaxApplied || taxSetting.taxApplyMode === TaxApplyMode.ALWAYS) {
            ;({ totalTax, totalTaxDiscount } = calculateTax(
              taxSetting,
              orderDetailsInTable,
              orderTotalWithDiscount
            ))
          }
        }

        // Tính tổng tiền sau thuế
        const orderTotalFinal = orderTotalWithDiscount + totalTax - totalTaxDiscount

        // Xử lý thanh toán tiền mặt hoặc chuyển khoản
        if (
          paymentMethod.type === PaymentMethodType.CASH ||
          paymentMethod.type === PaymentMethodType.BANKING
        ) {
          // Validate số tiền nhận
          if (orderTotalFinal > data.moneyReceived) {
            throw new HttpException('Tiền nhận không hợp lệ!', HttpStatus.CONFLICT)
          }

          if (data.moneyReceived !== undefined && orderTotalFinal > data.moneyReceived) {
            throw new HttpException('Giá trị giảm giá không hợp lệ!', HttpStatus.BAD_REQUEST)
          }

          // Tạo đơn hàng
          const createOrderPromise = prisma.order.create({
            data: {
              isDraft: false,
              paymentStatus: PaymentStatus.SUCCESS,
              tableId,
              orderTotal: orderTotalFinal,
              code: generateCode('DH', 15),
              note: data.note,
              type: OrderType.OFFLINE,
              bankingImages: data.bankingImages,
              moneyReceived: data.moneyReceived,
              paymentAt: new Date(),
              paymentMethodId: data.paymentMethodId,
              totalTax,
              totalTaxDiscount,
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
        timeout: TIMEOUT,
        maxWait: MAX_WAIT
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
