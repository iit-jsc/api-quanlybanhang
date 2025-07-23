import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PaymentOrderDto } from '../dto/payment.dto'
import {
  ActivityAction,
  OrderDetailStatus,
  PaymentMethodType,
  PaymentStatus,
  PrismaClient,
  TaxApplyMode
} from '@prisma/client'
import { getOrderTotal, handleOrderDetailsBeforePayment } from 'helpers'
import { orderSelect } from 'responses/order.response'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'
import { calculateTax } from 'helpers/tax.helper'
import { MAX_WAIT, TIMEOUT } from 'enums/common.enum'

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
    const [branch, order] = await Promise.all([
      this.prisma.branch.findUniqueOrThrow({
        where: {
          id: branchId
        },
        select: {
          branchSetting: true,
          taxSetting: true,
          paymentMethods: {
            where: {
              id: data.paymentMethodId
            }
          }
        }
      }),
      this.prisma.order.findUniqueOrThrow({
        where: { id },
        select: orderSelect
      })
    ])

    const { branchSetting, taxSetting } = branch
    const paymentMethod = branch.paymentMethods[0]

    let totalTax = 0
    let totalTaxDiscount = 0
    let isTaxTrulyIncluded = false

    if (order.paymentStatus === PaymentStatus.SUCCESS)
      throw new HttpException('Đơn hàng này đã thanh toán!', HttpStatus.CONFLICT)

    if (paymentMethod.type === PaymentMethodType.VNPAY) {
      throw new HttpException('Không thể chọn phương thức này!', HttpStatus.CONFLICT)
    }

    const newOrder = await this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        // Xử lý chi tiết đơn hàng trước khi thanh toán
        await handleOrderDetailsBeforePayment(prisma, { orderId: id, branchId })

        // Kiểm tra xem có setting sử dụng bếp hay không
        if (!branchSetting.useKitchen)
          await prisma.orderDetail.updateMany({
            where: { orderId: id, branchId },
            data: {
              status: OrderDetailStatus.SUCCESS,
              successAt: new Date()
            }
          })

        const orderTotalNotDiscount = getOrderTotal(order.orderDetails)

        if (orderTotalNotDiscount < data.discountValue)
          throw new HttpException('Giá trị giảm giá không hợp lệ!', HttpStatus.BAD_REQUEST)

        // Tính tổng tiền sau khi áp dụng giảm giá
        const orderTotalWithDiscount = orderTotalNotDiscount - data.discountValue

        if (taxSetting) {
          // Tính thuế nếu có
          if (data.isTaxApplied && !taxSetting.isActive)
            throw new HttpException(
              'Thuế chưa được cài đặt hoặc chưa được bật!',
              HttpStatus.BAD_REQUEST
            )

          if (data.isTaxApplied || taxSetting.taxApplyMode === TaxApplyMode.ALWAYS) {
            ;({ totalTax, totalTaxDiscount } = calculateTax(
              taxSetting,
              order.orderDetails,
              orderTotalWithDiscount
            ))

            // Kiểm tra xem thuế có thực sự được áp dụng hay không
            isTaxTrulyIncluded = true
          }
        }

        // Tính tổng tiền cuối cùng
        const orderTotalFinal = orderTotalWithDiscount + totalTax - totalTaxDiscount

        if (data.moneyReceived !== undefined && orderTotalFinal > data.moneyReceived) {
          throw new HttpException('Tiền nhận không hợp lệ!', HttpStatus.BAD_REQUEST)
        }

        return await prisma.order.update({
          where: { id, branchId },
          data: {
            isDraft: false,
            paymentStatus: PaymentStatus.SUCCESS,
            note: data.note,
            type: data.type,
            orderTotal: orderTotalFinal,
            moneyReceived: data.moneyReceived,
            bankingImages: data.bankingImages,
            customerId: data.customerId,
            paymentMethodId: data.paymentMethodId,
            discountValue: data.discountValue,
            paymentAt: new Date(),
            updatedBy: accountId,
            totalTax,
            totalTaxDiscount,
            isTaxApplied: isTaxTrulyIncluded
          },
          select: orderSelect
        })
      },
      {
        timeout: TIMEOUT,
        maxWait: MAX_WAIT
      }
    )

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
  }
}
