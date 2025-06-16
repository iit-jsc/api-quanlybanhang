import * as crypto from 'crypto'
import * as QRCode from 'qrcode'
import * as moment from 'moment'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { PrismaService } from 'nestjs-prisma'
import { SetupMerchantDto } from './dto/merchant.dto'
import {
  OrderStatus,
  OrderType,
  PaymentMethodType,
  PrismaClient,
  TransactionStatus
} from '@prisma/client'
import { CreateQrCodeDto } from './dto/qrCode.dto'
import { CheckTransactionDto } from './dto/check-transaction.dto'
import { VNPayIPNDto } from './dto/vnpay-ipn.dto'
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
import { decrypt, encrypt } from 'utils/encrypt'

export interface VnpayParams {
  [key: string]: any
}

export type MerchantInfo = {
  branchId: string
  createdAt: Date
  merchantName: string
  merchantType: string
  merchantCode: string
  genQRSecretKey?: string
  checkTransSecretKey?: string
  refundSecretKey?: string
  terminalId: string
}

@Injectable()
export class VNPayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly tableGatewayHandler: TableGatewayHandler,
    private readonly orderGatewayHandler: OrderGatewayHandler
  ) {}

  async setupMerchant(data: SetupMerchantDto) {
    return this.prisma.vNPayMerchant.create({
      data: {
        branchId: data.branchId,
        merchantCode: data.merchantCode,
        terminalId: data.terminalId,
        merchantName: data.merchantName,
        merchantType: data.merchantType,
        genQRSecretKey: encrypt(data.genQRSecretKey),
        checkTransSecretKey: encrypt(data.checkTransSecretKey),
        refundSecretKey: encrypt(data.refundSecretKey)
      }
    })
  }

  async generateQrCode(data: CreateQrCodeDto, branchId: string, accountId: string) {
    const merchantInfo = await this.getMerchantInfo(branchId)

    if (!merchantInfo)
      throw new HttpException(
        `Không tìm thấy thông tin merchant cho branchId: ${branchId}`,
        HttpStatus.NOT_FOUND
      )

    // check bàn có đang thanh toán hay không?
    const existingTransaction = await this.prisma.vNPayTransaction.findFirst({
      where: {
        tableId: data.tableId,
        status: TransactionStatus.PENDING
      },
      select: { table: true }
    })

    if (existingTransaction)
      throw new HttpException(
        `Bàn ${existingTransaction.table.name} đang có giao dịch đang xử lý!`,
        HttpStatus.BAD_REQUEST
      )

    const orderDraft = await this.createOrderByTableId(data, accountId, branchId)

    const payload = this.buildVNPayPayload(
      merchantInfo,
      orderDraft.orderTotal.toString(),
      orderDraft.code
    )

    try {
      const response = await this.httpService.post(process.env.VNP_CREATE_QR, payload).toPromise()
      const qrData = response.data?.data
      if (!qrData) {
        throw new HttpException(`Không nhận được dữ liệu từ VNP!`, HttpStatus.NOT_FOUND)
      }

      // Tạo vNPayTransaction
      await this.prisma.vNPayTransaction.create({
        data: {
          branchId,
          orderId: orderDraft.id,
          tableId: data.tableId,
          vnpTxnRef: orderDraft.code,
          status: TransactionStatus.PENDING
        }
      })

      return await this.generateQrCodeImage(qrData)
    } catch (error) {
      throw new HttpException(
        `Không thể tạo mã QR: ${error?.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      )
    }
  }

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

  private buildVNPayPayload(merchantInfo: MerchantInfo, amount: string, txnId: string) {
    const appId = 'MERCHANT'
    const merchantName = merchantInfo.merchantName
    const merchantCode = merchantInfo.merchantCode
    const merchantType = merchantInfo.merchantType
    const terminalId = merchantInfo.terminalId
    const secretKey = merchantInfo.genQRSecretKey
    const serviceCode = '03'
    const countryCode = 'VN'
    const masterMerCode = 'A000000775'
    const payType = '03'
    const productId = ''
    const tipAndFee = ''
    const ccy = '704'
    const expDate = moment().add(10, 'minutes').format('YYMMDDHHmm')

    const dataString = [
      appId,
      merchantName,
      serviceCode,
      countryCode,
      masterMerCode,
      merchantType,
      merchantCode,
      terminalId,
      payType,
      productId,
      txnId,
      amount,
      tipAndFee,
      ccy,
      expDate,
      secretKey
    ].join('|')

    const checksum = crypto.createHash('md5').update(dataString).digest('hex').toUpperCase()

    return {
      appId,
      merchantName,
      serviceCode,
      countryCode,
      masterMerCode,
      merchantType,
      merchantCode,
      terminalId,
      payType,
      productId,
      txnId,
      amount,
      tipAndFee,
      ccy,
      expDate,
      desc: '',
      checksum,
      billNumber: txnId,
      purpose: ''
    }
  }

  private async generateQrCodeImage(qrData: string) {
    const qrOptions = {
      errorCorrectionLevel: 'M',
      width: 200,
      height: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
    return QRCode.toDataURL(qrData, qrOptions)
  }

  async getMerchantInfo(branchId: string) {
    const merchantInfo = await this.prisma.vNPayMerchant.findUnique({
      where: { branchId }
    })
    if (!merchantInfo) {
      throw new HttpException(
        `Không tìm thấy thông tin merchant cho branchId: ${branchId}`,
        HttpStatus.NOT_FOUND
      )
    }
    return {
      ...merchantInfo,
      genQRSecretKey: decrypt(merchantInfo.genQRSecretKey),
      checkTransSecretKey: decrypt(merchantInfo.checkTransSecretKey),
      refundSecretKey: decrypt(merchantInfo.refundSecretKey)
    }
  }

  async deleteTransactionByTableId(tableId: string, branchId: string) {
    // Xóa hết đơn nháp
    await this.prisma.order.deleteMany({ where: { tableId, isDraft: true, branchId } })

    return this.prisma.vNPayTransaction.deleteMany({
      where: { tableId, status: TransactionStatus.PENDING, branchId }
    })
  }

  async checkTransaction(dto: CheckTransactionDto, branchId: string) {
    // Lấy thông tin merchant từ bảng vNPayMerchant
    const merchant = await this.getMerchantInfo(branchId)

    if (!merchant) {
      throw new HttpException('Merchant không hợp lệ', HttpStatus.BAD_REQUEST)
    }

    // Tính checksum
    const dataString = `${dto.payDate}|${dto.txnId}|${merchant.merchantCode}|${merchant.terminalId}|${merchant.checkTransSecretKey}`
    const checksum = crypto.createHash('md5').update(dataString).digest('hex').toLowerCase()

    const apiBody = {
      merchantCode: merchant.merchantCode,
      checkSum: checksum,
      terminalID: merchant.terminalId,
      txnId: dto.txnId,
      payDate: dto.payDate
    }

    try {
      const response = await this.httpService
        .post(process.env.VNP_CHECK_TRANS_URL, apiBody)
        .toPromise()

      const result = response.data

      return result
    } catch (error) {
      throw new HttpException(
        error?.response?.data || error.message || 'Lỗi khi gọi đối tác VNPay',
        HttpStatus.BAD_GATEWAY
      )
    }
  }

  async vnPayIPNCallback(ipnDto: VNPayIPNDto) {
    const { txnId, payDate, code, checksum } = ipnDto

    console.log(new Date(), 'run IPN Callback with data:', ipnDto)

    // 1. Lấy transaction theo txnId
    const transaction = await this.prisma.vNPayTransaction.findUnique({
      where: { vnpTxnRef: txnId },
      include: { order: true }
    })

    if (!transaction) {
      return {
        code: '03',
        message: 'Đơn hàng không tồn tại',
        data: { txnId }
      }
    }

    // 2. Lấy thông tin merchant qua order -> branchId -> getMerchantInfo
    const merchant = await this.getMerchantInfo(transaction.order.branchId)
    if (!merchant) {
      return {
        code: '06',
        message: 'Sai thông tin xác thực',
        data: { txnId }
      }
    }

    // 3. Xác thực checksum (dùng secret key từ .env)
    const secretKey = process.env.VNP_IPN_SECRET_KEY
    const dataString = `${payDate}|${txnId}|${merchant.merchantCode}|${merchant.terminalId}|${secretKey}`
    const validChecksum = crypto.createHash('md5').update(dataString).digest('hex').toLowerCase()

    if (checksum !== validChecksum) {
      return {
        code: '06',
        message: 'Sai thông tin xác thực',
        data: { txnId }
      }
    }

    // 4. Kiểm tra số tiền thanh toán có đúng không
    const orderAmount = transaction.order.orderTotal
    if (Number(ipnDto['amount']) !== Number(orderAmount)) {
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
    await this.prisma.vNPayTransaction.update({
      where: { vnpTxnRef: txnId },
      data: {
        status: code === '00' ? TransactionStatus.SUCCESS : TransactionStatus.FAILED
      }
    })

    // 7. Cập nhật trạng thái đơn hàng nếu thành công
    if (transaction.orderId && code === '00') {
      await this.handlePaymentSuccess(this.prisma, transaction.orderId)
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

  private async handlePaymentSuccess(prisma: PrismaClient, orderId: string) {
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
  }
}
