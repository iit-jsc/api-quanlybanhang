import * as fs from 'fs/promises'
import { DiscountIssue, Order, Promotion } from '@prisma/client'
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { AnyObject, ICustomer, IOrderDetail } from 'interfaces/common.interface'
import { DISCOUNT_TYPE } from 'enums/common.enum'
import { formatDate } from 'utils/Helps'
import { ENDOW_TYPE } from 'enums/user.enum'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailOrderSuccess(order: AnyObject) {
    const { orderDetails, customerDiscount, branch } = order

    const htmlTemplate = await fs.readFile(
      './src/mail/templates/order-success.html',
      'utf8'
    )

    const totalOrder = this.getTotalInOrder(orderDetails)

    const discountValue = this.getDiscountValue(
      order.discountCode?.discountIssue,
      totalOrder
    )

    const promotionValue = this.getPromotionValue(order.promotion, totalOrder)

    let totalDiscount = discountValue + promotionValue

    const orderDetailsHTML = this.getOrderDetailsHTML(orderDetails)

    let paymentAmount = totalOrder - totalDiscount

    if (paymentAmount < 0) paymentAmount = totalOrder

    const htmlContent = htmlTemplate
      .replaceAll('{{order.code}}', order.code)
      .replaceAll('{{order.createdAt}}', formatDate(order.createdAt))
      .replaceAll('{{customer.name}}', customerDiscount.name)
      .replaceAll('{{customer.email}}', customerDiscount.email || '')
      .replaceAll('{{customer.phone}}', customerDiscount.phone || '')
      .replaceAll('{{customer.address}}', customerDiscount.address || '')
      .replaceAll('{{branch.phone}}', branch.phone || '')
      .replaceAll('{{branch.email}}', branch.email || '')
      .replaceAll('{{branch.name}}', branch.name || '')
      .replaceAll('{{branch.address}}', branch.name || '')
      .replaceAll('{{shop.name}}', branch.shop?.name || '')
      .replaceAll('{{discountValue}}', totalDiscount?.toLocaleString('vi-VN'))
      .replaceAll('{{totalAmount}}', totalOrder.toLocaleString('vi-VN'))
      .replaceAll('{{paymentAmount}}', paymentAmount?.toLocaleString('vi-VN'))
      .replaceAll('{{order.orderDetails}}', orderDetailsHTML)
      .replaceAll('{{order.id}}', order.id)

    await this.mailerService.sendMail({
      to: customerDiscount.email,
      subject: `Đặt hàng thành công #${order.code}`,
      html: htmlContent
    })
  }

  getOrderDetailsHTML(orderDetails: IOrderDetail[]) {
    const orderDetailsHTML = orderDetails
      .map((item, index) => {
        const optionsTotalPrice = item.productOptions
          ? item.productOptions.reduce((sum, option) => sum + option.price, 0)
          : 0

        const totalPricePerItem =
          (item.product.price + optionsTotalPrice) * item.amount

        return `
        <tr>
            <td>${index + 1}</td>
            <td>
                <strong>${item.product?.name} (${item.product?.price?.toLocaleString('vi-VN')} đ)</strong><br />
                ${
                  item.productOptions
                    ? item.productOptions
                        .map(
                          option =>
                            `+ ${option.name} (${option.price.toLocaleString('vi-VN')} đ)`
                        )
                        .join('<br />')
                    : ''
                }
            </td>
            <td>${item.amount}</td>
            <td>${(item.product.price + optionsTotalPrice).toLocaleString('vi-VN')} đ</td>
            <td>${totalPricePerItem.toLocaleString('vi-VN')} đ</td>
        </tr>
      `
      })
      .join('')

    return orderDetailsHTML
  }

  getTotalInOrder(orderDetails: IOrderDetail[]) {
    return orderDetails?.reduce((total, order) => {
      const productPrice = order.product?.price || 0

      const optionsTotal = (order.productOptions || []).reduce(
        (sum, option) => sum + (option.price || 0),
        0
      )

      return total + order.amount * (productPrice + optionsTotal)
    }, 0)
  }

  getDiscountValue(discountIssue: DiscountIssue, totalOrder: number) {
    let result = 0

    if (!discountIssue) return 0

    if (discountIssue.discountType === DISCOUNT_TYPE.PERCENT)
      result = (totalOrder * discountIssue.discount) / 100

    if (discountIssue.discountType === DISCOUNT_TYPE.VALUE)
      result = discountIssue.discount

    if (discountIssue.maxValue !== null && discountIssue.maxValue < result)
      result = discountIssue.maxValue

    return result
  }

  getDiscountCustomer(customer: ICustomer, totalOrder: number) {
    if (customer.endow === ENDOW_TYPE.BY_CUSTOMER) {
      if (customer.discountType === DISCOUNT_TYPE.PERCENT)
        return (totalOrder * customer.discount) / 100

      if (customer.discountType === DISCOUNT_TYPE.VALUE)
        return customer.discount
    } else {
      if (!customer.customerType) return 0

      if (customer.customerType?.discountType === DISCOUNT_TYPE.PERCENT)
        return (totalOrder * customer.customerType?.discount) / 100

      if (customer.customerType?.discountType === DISCOUNT_TYPE.VALUE)
        return customer.customerType?.discount
    }

    return 0
  }

  getPromotionValue(promotion: Promotion, totalOrder: number) {
    let result = 0

    if (!promotion) return 0

    if (promotion.discountType === DISCOUNT_TYPE.PERCENT)
      result = (totalOrder * promotion.discount) / 100

    if (promotion.discountType === DISCOUNT_TYPE.VALUE)
      result = promotion.discount

    if (promotion.maxValue !== null && promotion.maxValue < result)
      result = promotion.maxValue

    return result
  }
}
