import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { OrderStatus, OrderType, PaymentMethodType, PrismaClient } from '@prisma/client'
import { CreateQrCodeDto } from '../dto/qrCode.dto'
import {
  generateCode,
  getCustomerDiscount,
  getDiscountCode,
  getOrderTotal,
  getVoucher
} from 'utils/Helps'
import { orderSelect } from 'responses/order.response'
import { TableGatewayHandler } from 'src/gateway/handlers/table.handler'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'

@Injectable()
export class VNPayOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tableGatewayHandler: TableGatewayHandler,
    private readonly orderGatewayHandler: OrderGatewayHandler
  ) {}

  async createOrderByTableId(data: CreateQrCodeDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async prisma => {
      const paymentMethod = await this.prisma.paymentMethod.findUnique({
        where: {
          type_branchId: { type: PaymentMethodType.VNPAY, branchId }
        }
      })

      // Lấy danh sách món từ bàn
      const orderDetailsInTable = await prisma.orderDetail.findMany({
        where: {
          tableId: data.tableId,
          branchId
        },
        select: {
          id: true,
          amount: true,
          note: true,
          status: true,
          product: true,
          productOriginId: true,
          productOptions: true,
          createdBy: true,
          updatedBy: true,
          branchId: true,
          tableId: true
        }
      })

      if (!orderDetailsInTable.length) {
        throw new HttpException('Không tìm thấy món!', HttpStatus.BAD_REQUEST)
      }

      // Tính tổng tiền chưa giảm giá
      const orderTotalNotDiscount = getOrderTotal(orderDetailsInTable)

      // Lấy thông tin giảm giá (nếu có truyền vào mã giảm giá/voucher/customerId thì lấy từ data)
      const voucherParams = {
        voucherId: data.voucherId,
        branchId,
        orderDetails: orderDetailsInTable,
        voucherCheckRequest: {
          orderTotal: orderTotalNotDiscount,
          totalPeople: data.totalPeople
        }
      }

      const [voucher, discountCodeValue, customerDiscountValue] = await Promise.all([
        getVoucher(voucherParams, this.prisma),
        getDiscountCode(data.discountCode, orderTotalNotDiscount, branchId, this.prisma),
        getCustomerDiscount(data.customerId, orderTotalNotDiscount, this.prisma)
      ])

      const orderTotal =
        orderTotalNotDiscount -
        (voucher.voucherValue || 0) -
        (discountCodeValue || 0) -
        (customerDiscountValue || 0)

      // Tạo đơn hàng nháp
      const order = await prisma.order.create({
        data: {
          isPaid: false,
          isDraft: true,
          tableId: data.tableId,
          orderTotal,
          code: data.code || generateCode('DH', 15),
          type: OrderType.OFFLINE,
          status: OrderStatus.SUCCESS,
          createdBy: accountId,
          branchId,
          discountCodeValue: discountCodeValue,
          voucherValue: voucher.voucherValue,
          voucherProducts: voucher.voucherProducts,
          customerDiscountValue: customerDiscountValue,
          paymentMethodId: paymentMethod?.id,
          ...(data.customerId && { customerId: data.customerId }),
          orderDetails: {
            connect: orderDetailsInTable.map(od => ({ id: od.id }))
          }
        }
      })

      return order
    })
  }

  async handlePaymentSuccess(prisma: PrismaClient, orderId: string) {
    try {
      await prisma.orderDetail.updateMany({
        where: { orderId },
        data: { tableId: null, orderId }
      })

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { isPaid: true, isDraft: false, paymentAt: new Date() },
        select: orderSelect
      })

      await Promise.all([
        this.tableGatewayHandler.handleUpdateTable(updatedOrder.table, updatedOrder.branchId),
        this.orderGatewayHandler.handlePaymentSuccessfully(updatedOrder, updatedOrder.branchId)
      ])
    } catch (error) {
      console.log(error)
    }
  }

  async validateOrderAmount(orderId: string, expectedAmount: number): Promise<boolean> {
    const orderDetails = await this.prisma.orderDetail.findMany({
      where: { orderId }
    })

    const totalCurrentAmount = getOrderTotal(orderDetails)
    return totalCurrentAmount === expectedAmount
  }
}
