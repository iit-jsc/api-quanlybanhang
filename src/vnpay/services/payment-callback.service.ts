import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { TransactionStatus } from '@prisma/client'
import { VNPayIPNDto } from '../dto/vnpay-ipn.dto'
import { MerchantService } from './merchant.service'
import { ChecksumService } from './checksum.service'
import { TransactionService } from './transaction.service'
import { VNPayOrderService } from './vnpay-order.service'
import { getOrderTotal } from 'utils/Helps'

@Injectable()
export class PaymentCallbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantService: MerchantService,
    private readonly checksumService: ChecksumService,
    private readonly transactionService: TransactionService,
    private readonly vnPayOrderService: VNPayOrderService
  ) {}

  async vnPayIPNCallback(ipnDto: VNPayIPNDto) {
    const {
      txnId,
      payDate,
      code,
      checksum,
      msgType,
      qrTrace,
      bankCode,
      mobile,
      accountNo,
      amount
    } = ipnDto

    // 1. Lấy transaction theo txnId
    const transaction = await this.transactionService.getTransactionByTxnId(txnId)

    if (!transaction) {
      return {
        code: '03',
        message: 'Đơn hàng không tồn tại',
        data: { txnId }
      }
    }

    // 2. Lấy thông tin merchant qua order -> branchId -> getMerchantInfo
    const merchant = await this.merchantService.getMerchantInfo(transaction.order.branchId)

    if (!merchant) {
      return {
        code: '06',
        message: 'Sai thông tin xác thực',
        data: { txnId }
      }
    }

    // 3. Xác thực checksum theo định dạng VNPay QR
    const secretKey = process.env.VNP_IPN_SECRET_KEY
    const validChecksum = this.checksumService.generateIPNChecksum(
      code,
      msgType,
      txnId,
      qrTrace,
      bankCode,
      mobile,
      accountNo || '',
      amount,
      payDate,
      merchant.merchantCode,
      secretKey
    )

    if (checksum !== validChecksum) {
      return {
        code: '06',
        message: 'Sai thông tin xác thực',
        data: {
          txnId,
          expected: validChecksum,
          received: checksum
        }
      }
    }

    // 4. Kiểm tra số tiền thanh toán có đúng không
    const orderAmount = transaction.order.orderTotal
    const orderDetails = await this.prisma.orderDetail.findMany({
      where: { tableId: transaction.order.tableId }
    })

    const totalCurrentAmount = getOrderTotal(orderDetails)

    if (Number(ipnDto['amount']) !== orderAmount || orderAmount !== totalCurrentAmount) {
      return {
        code: '07',
        message: 'Số tiền không chính xác',
        data: { amount: orderAmount }
      }
    }

    // 5. Đơn đã thanh toán rồi
    if (transaction.order.isPaid) {
      return {
        code: '05',
        message: 'Đơn hàng đang được xử lý',
        data: { txnId }
      }
    }

    // 6. Cập nhật trạng thái giao dịch (Merchant Payment)
    await this.transactionService.updateTransactionStatus(
      txnId,
      code === '00' ? TransactionStatus.SUCCESS : TransactionStatus.FAILED
    )

    // 7. Cập nhật trạng thái
    if (transaction.orderId && code === '00') {
      await this.vnPayOrderService.handlePaymentSuccess(this.prisma, transaction.orderId)

      return {
        code: '00',
        message: 'Đặt hàng thành công',
        data: { txnId }
      }
    }

    // 8. Trường hợp khác (timeout, lỗi tạo đơn...)
    return {
      code: code,
      message: 'Lỗi xử lý giao dịch',
      data: { txnId }
    }
  }
}
