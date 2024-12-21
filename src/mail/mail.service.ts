import { Customer } from './../../node_modules/.prisma/client/index.d';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { AnyObject } from 'interfaces/common.interface';
import * as fs from 'fs/promises';
import { Prisma } from '@prisma/client';
import { DISCOUNT_TYPE } from 'enums/common.enum';
import { formatDate } from 'utils/Helps';
import { ENDOW_TYPE } from 'enums/user.enum';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService
  ) { }

  async sendEmailOrderSuccess(order: AnyObject) {
    const { orderDetails, customer, branch } = order

    const htmlTemplate = await fs.readFile('./src/mail/templates/order-success.html', 'utf8');

    const totalOrder = this.getTotalInOrder(orderDetails)

    const discountValue = this.getDiscountValue(order.discountCode?.discountIssue, totalOrder)

    const customerDiscount = this.getDiscountCustomer(order.customer, totalOrder)

    let totalDiscount = discountValue + customerDiscount

    const orderDetailsHTML = this.getOrderDetailsHTML(orderDetails)

    let paymentAmount = totalOrder - totalDiscount

    if (paymentAmount < 0)
      paymentAmount = totalOrder

    const htmlContent = htmlTemplate
      .replaceAll('{{order.code}}', order.code)
      .replaceAll('{{order.createdAt}}', formatDate(order.createdAt))
      .replaceAll('{{customer.name}}', customer.name)
      .replaceAll('{{customer.email}}', customer.email || "")
      .replaceAll('{{customer.phone}}', customer.phone || "")
      .replaceAll('{{customer.address}}', customer.address || "")
      .replaceAll('{{branch.phone}}', branch.phone || "")
      .replaceAll('{{branch.email}}', branch.email || "")
      .replaceAll('{{branch.name}}', branch.name || "")
      .replaceAll('{{branch.address}}', branch.name || "")
      .replaceAll('{{shop.name}}', branch.shop?.name || "")
      .replaceAll('{{discountValue}}', totalDiscount?.toLocaleString('vi-VN'))
      .replaceAll('{{totalAmount}}', totalOrder.toLocaleString('vi-VN'))
      .replaceAll('{{paymentAmount}}', paymentAmount?.toLocaleString('vi-VN'))
      .replaceAll('{{order.orderDetails}}', orderDetailsHTML)
      .replaceAll('{{order.id}}', order.id);

    await this.mailerService.sendMail({
      to: customer.email,
      subject: `Đặt hàng thành công #${order.code}`,
      html: htmlContent,
    });
  }

  getOrderDetailsHTML(orderDetails: AnyObject) {
    const orderDetailsHTML = orderDetails
      .map(
        (item, index) => {
          const optionsTotalPrice = item.productOptions
            ? item.productOptions.reduce((sum, option) => sum + option.price, 0)
            : 0;

          const totalPricePerItem = (item.product.price + optionsTotalPrice) * item.amount;

          return `
        <tr>
            <td>${index + 1}</td>
            <td>
                <strong>${item.product?.name} (${item.product?.price?.toLocaleString('vi-VN')} đ)</strong><br />
                ${item.productOptions
              ? item.productOptions
                .map(
                  (option) =>
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
      `;
        }
      )
      .join('');

    return orderDetailsHTML;
  }

  getTotalInOrder(orderDetails: AnyObject) {
    return orderDetails?.reduce((total, order) => {
      const productPrice = order.product?.price || 0;

      const optionsTotal = (order.productOptions || []).reduce((sum, option) => sum + (option.price || 0), 0);

      return total + order.amount * (productPrice + optionsTotal);
    }, 0);
  }

  getDiscountValue(discountIssue: Prisma.DiscountIssueCreateInput, totalOrder: number) {
    let result = 0;

    if (!discountIssue) return 0

    if (discountIssue.discountType === DISCOUNT_TYPE.PERCENT)
      result = totalOrder * discountIssue.discount / 100

    if (discountIssue.discountType === DISCOUNT_TYPE.VALUE)
      result = discountIssue.discount

    if (discountIssue.maxValue !== null && discountIssue.maxValue < result)
      result = discountIssue.maxValue

    return result;
  }

  getDiscountCustomer(customer: AnyObject, totalOrder: number) {
    if (customer.endow === ENDOW_TYPE.BY_CUSTOMER) {
      if (customer.discountType === DISCOUNT_TYPE.PERCENT)
        return totalOrder * customer.discount / 100

      if (customer.discountType === DISCOUNT_TYPE.VALUE)
        return customer.discount

    } else {
      if (!customer.customerType) return 0;

      if (customer.customerType?.discountType === DISCOUNT_TYPE.PERCENT)
        return totalOrder * customer.customerType?.discount / 100

      if (customer.customerType?.discountType === DISCOUNT_TYPE.VALUE)
        return customer.customerType?.discount

    }

    return 0;
  }
}
