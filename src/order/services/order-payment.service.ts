import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PaymentOrderDto } from '../dto/payment.dto'
import {
  ActivityAction,
  OrderDetailStatus,
  PaymentMethodType,
  PaymentStatus,
  PrismaClient
} from '@prisma/client'
import { getCustomerDiscount, getOrderTotal, handleOrderDetailsBeforePayment } from 'helpers'
import { orderSelect } from 'responses/order.response'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'

@Injectable()
export class OrderPaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly orderGatewayHandler: OrderGatewayHandler
  ) {}

  async payment(
    id: string,
    data: PaymentOrderDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        await handleOrderDetailsBeforePayment(prisma, { orderId: id, branchId })

        const order = await prisma.order.findUniqueOrThrow({
          where: { id },
          select: orderSelect
        })

        if (order.paymentStatus === PaymentStatus.SUCCESS)
          throw new HttpException('Đơn hàng này đã thanh toán!', HttpStatus.CONFLICT)

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
          })
        ])

        // Kiểm tra xem có setting sử dụng bếp hay không
        if (!branchSetting.useKitchen)
          await prisma.orderDetail.updateMany({
            where: { orderId: id, branchId },
            data: {
              status: OrderDetailStatus.SUCCESS,
              successAt: new Date()
            }
          })

        // Kiểm tra phương thức thanh toán
        if (paymentMethod.type === PaymentMethodType.VNPAY) {
          throw new HttpException('Không thể chọn phương thức này!', HttpStatus.CONFLICT)
        }

        const orderTotalNotDiscount = getOrderTotal(order.orderDetails)

        const [customerDiscountValue] = await Promise.all([
          getCustomerDiscount(data.customerId, orderTotalNotDiscount, prisma)
        ])

        const orderTotal = orderTotalNotDiscount - customerDiscountValue

        const newOrder = await prisma.order.update({
          where: { id },
          data: {
            isDraft: false,
            paymentStatus: PaymentStatus.SUCCESS,
            note: data.note,
            type: data.type,
            orderTotal,
            customerDiscountValue,
            moneyReceived: data.moneyReceived,
            bankingImages: data.bankingImages,
            customerId: data.customerId,
            paymentMethodId: data.paymentMethodId,
            paymentAt: new Date(),
            updatedBy: accountId
          },
          select: orderSelect
        })

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
          this.orderGatewayHandler.handleCreateOrder(newOrder, branchId, deviceId)
        ])

        return newOrder
      },
      {
        timeout: 10_000,
        maxWait: 15_000
      }
    )
  }
}
