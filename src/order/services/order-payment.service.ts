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
import { getCustomerDiscount, getOrderTotal, handleOrderDetailsBeforePayment } from 'helpers'
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
    const branch = await this.prisma.branch.findUniqueOrThrow({
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
    })

    const { branchSetting, taxSetting } = branch
    const paymentMethod = branch.paymentMethods[0]
    let totalTax = 0
    let totalTaxDiscount = 0

    const newOrder = await this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        await handleOrderDetailsBeforePayment(prisma, { orderId: id, branchId })

        const order = await prisma.order.findUniqueOrThrow({
          where: { id },
          select: orderSelect
        })

        if (order.paymentStatus === PaymentStatus.SUCCESS)
          throw new HttpException('Đơn hàng này đã thanh toán!', HttpStatus.CONFLICT)

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

        const customerDiscountValue = await getCustomerDiscount(
          data.customerId,
          orderTotalNotDiscount,
          prisma
        )

        // Tính tổng tiền sau khi áp dụng giảm giá
        let orderTotal = orderTotalNotDiscount - customerDiscountValue
        console.log('taxSetting', taxSetting)

        // Tính thuế nếu có
        if (data.isTaxApplied && !taxSetting && !taxSetting?.isActive)
          throw new HttpException('Thuế chưa được cài đặt!', HttpStatus.BAD_REQUEST)
        else {
          if (data.isTaxApplied || taxSetting.taxApplyMode === TaxApplyMode.ALWAYS) {
            ;({ totalTax, totalTaxDiscount } = calculateTax(
              taxSetting,
              order.orderDetails,
              orderTotal
            ))
          }
        }

        // Tính tổng tiền cuối cùng
        orderTotal = orderTotal + totalTax - totalTaxDiscount

        return await prisma.order.update({
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
            updatedBy: accountId,
            totalTax,
            totalTaxDiscount
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
