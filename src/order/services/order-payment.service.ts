import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PaymentOrderDto } from '../dto/payment.dto'
import {
  ActivityAction,
  NotifyType,
  OrderDetailStatus,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
  PrismaClient,
  EInvoiceStatus
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
import { NotifyService } from 'src/notify/notify.service'
import { EInvoiceService } from 'src/einvoice/einvoice.service'

@Injectable()
export class OrderPaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly orderGatewayHandler: OrderGatewayHandler,
    private readonly notifyService: NotifyService,
    private readonly eInvoiceService: EInvoiceService
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
              status: OrderDetailStatus.SUCCESS,
              successAt: new Date()
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
            // paymentStatus: PaymentStatus.SUCCESS,
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
          this.notifyService.create(
            {
              type: NotifyType.INFORMED_DISH,
              content: `Có món yêu cầu chế biến!`
            },
            branchId,
            deviceId
          ),
          // Tạo hóa đơn điện tử
          this.createEInvoice(newOrder, data.customerId, prisma)
        ])

        return newOrder
      },
      {
        timeout: 10_000,
        maxWait: 15_000
      }
    )
  }
  /**
   * Tạo hóa đơn điện tử theo quy trình đúng chuẩn POS
   */
  private async createEInvoice(order: any, customerId?: string, prisma?: PrismaClient) {
    try {
      // Lấy thông tin khách hàng nếu có
      let customer = null
      if (customerId) {
        customer = await prisma.customer.findUnique({
          where: { id: customerId }
        })
      }

      console.log('🏗️ Bắt đầu tạo hóa đơn điện tử cho đơn hàng:', order.id)

      // Bước 1: Tạo bản ghi hóa đơn với trạng thái PENDING
      const invoiceRecord = await prisma.eInvoice.create({
        data: {
          orderId: order.id,
          pattern: '',
          serial: '',
          invoiceNumber: order.code,
          status: EInvoiceStatus.PENDING,
          xmlData: '',
          responseData: '',
          publishedAt: null
        }
      })

      console.log('📝 Đã tạo bản ghi hóa đơn PENDING:', invoiceRecord.id)

      // // Bước 2: Tạo dữ liệu hóa đơn
      const invoiceData = this.eInvoiceService.createInvoiceFromOrder(order, customer)

      console.log('📋 Dữ liệu hóa đơn đã chuẩn bị:', {
        customer: invoiceData.customer.cusName,
        total: invoiceData.total,
        products: invoiceData.products.length
      })

      // Bước 3: Gọi API gửi hóa đơn đến CQT (sử dụng API mới cho máy tính tiền)
      const result = await this.eInvoiceService.publishInvoice(invoiceData)

      console.log('📤 Kết quả gửi hóa đơn:', result)

      // // Bước 4: Cập nhật trạng thái hóa đơn
      // if (result.success) {
      //   await prisma.eInvoice.update({
      //     where: { id: invoiceRecord.id },
      //     data: {
      //       pattern: result.pattern || '',
      //       serial: result.serial || '',
      //       invoiceNumber: result.invoiceNumber || '',
      //       status: EInvoiceStatus.SENT,
      //       publishedAt: new Date()
      //     }
      //   })

      //   console.log(`✅ Hóa đơn điện tử đã gửi thành công`)
      //   console.log(`📋 Số hóa đơn: ${result.invoiceNumber}`)
      //   console.log(`📋 Mẫu số: ${result.pattern}, Ký hiệu: ${result.serial}`)
      // } else {
      //   await prisma.eInvoice.update({
      //     where: { id: invoiceRecord.id },
      //     data: {
      //       status: EInvoiceStatus.ERROR,
      //       responseData: result.error || 'Lỗi không xác định'
      //     }
      //   })

      //   console.error(`❌ 1111 Lỗi gửi hóa đơn điện tử: ${result.error}`)
      // }

      // return result
    } catch (error) {
      console.error('❌ Exception khi tạo hóa đơn điện tử:', error)

      // // Cập nhật trạng thái ERROR nếu có exception
      // try {
      //   await prisma.eInvoice.updateMany({
      //     where: {
      //       orderId: order.id,
      //       status: 'PENDING'
      //     },
      //     data: {
      //       status: 'ERROR',
      //       responseData: error.message || 'Lỗi không xác định'
      //     }
      //   })
      // } catch (updateError) {
      //   console.error('❌ Lỗi cập nhật trạng thái hóa đơn:', updateError)
      // }

      // // Không throw error để không ảnh hưởng đến quy trình thanh toán chính
      // return {
      //   success: false,
      //   error: error.message || 'Lỗi không xác định'
      // }
    }
  }
}
