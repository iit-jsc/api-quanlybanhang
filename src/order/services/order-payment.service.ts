import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PaymentOrderDto } from '../dto/payment.dto'
import {
  ActivityAction,
  OrderDetailStatus,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
  PrismaClient
} from '@prisma/client'
import {
  getCustomerDiscount,
  getDiscountCode,
  getOrderTotal,
  getVoucher,
  handleOrderDetailsBeforePayment
} from 'utils/Helps'
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
    const result = await this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        await handleOrderDetailsBeforePayment(prisma, { orderId: id })

        const order = await prisma.order.findFirstOrThrow({
          where: { id },
          select: orderSelect
        })

        if (order.paymentStatus === PaymentStatus.SUCCESS)
          throw new HttpException('Đơn hàng này đã thành toán!', HttpStatus.CONFLICT)

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
              status: OrderDetailStatus.SUCCESS
            }
          })

        // Kiểm tra phương thức thanh toán
        if (paymentMethod.type === PaymentMethodType.VNPAY) {
          throw new HttpException('Không thể chọn phương thức này!', HttpStatus.CONFLICT)
        }

        const orderTotalNotDiscount = getOrderTotal(order.orderDetails)

        const voucherParams = {
          voucherId: data.voucherId,
          branchId,
          orderDetails: order.orderDetails,
          voucherCheckRequest: {
            orderTotal: orderTotalNotDiscount
          }
        }

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

        const newOrder = await prisma.order.update({
          where: { id },
          data: {
            paymentStatus: PaymentStatus.SUCCESS,
            note: data.note,
            type: data.type,
            orderTotal,
            voucherProducts: voucher.voucherProducts,
            voucherValue: voucher.voucherValue,
            discountCodeValue,
            customerDiscountValue,
            moneyReceived: data.moneyReceived,
            status: data.status || OrderStatus.SUCCESS,
            bankingImages: data.bankingImages,
            customerId: data.customerId,
            paymentMethodId: data.paymentMethodId,
            paymentAt: new Date(),
            updatedBy: accountId
          },
          select: orderSelect
        })

        return newOrder
      },
      {
        timeout: 10_000,
        maxWait: 15_000
      }
    )

    await Promise.all([
      this.activityLogService.create(
        {
          action: ActivityAction.PAYMENT,
          modelName: 'Order',
          targetName: result.code,
          targetId: result.id
        },
        { branchId },
        accountId
      ),
      this.orderGatewayHandler.handleCreateOrder(result, branchId, deviceId)
    ])

    return result
  }
}
