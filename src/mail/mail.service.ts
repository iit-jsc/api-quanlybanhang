import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AnyObject } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class MailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService
  ) { }

  async sendEmailOrderSuccess(order: AnyObject) {
    const { orderDetails, customer } = order

    await this.mailerService.sendMail({
      to: customer.email, 
      subject: `Xác nhận đơn hàng #${order.code}`,
      template: './order-success',
      context: {
        customerName: customer.name,
        orderDate: customer.createdAt,
        orderItems: orderDetails,
        totalAmount: 0,
      },
    });
  }
}
