import * as crypto from 'crypto'
import * as QRCode from 'qrcode'
import * as moment from 'moment'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { PrismaService } from 'nestjs-prisma'
import { SetupMerchantDto } from './dto/merchant.dto'
import {
  ActivityAction,
  OrderDetailStatus,
  OrderStatus,
  OrderType,
  PaymentMethodType,
  PaymentStatus,
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
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { PaymentReviewingOrderDto } from 'src/order/dto/payment.dto'
import { orderDetailSelect } from 'responses/order-detail.response'

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
    private readonly orderGatewayHandler: OrderGatewayHandler,
    private readonly activityLogService: ActivityLogService
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

    // check bàn / đơn có đang thanh toán hay không?
    const existingTransaction = await this.prisma.vNPayTransaction.findFirst({
      where: {
        status: TransactionStatus.PENDING,
        OR: [{ tableId: data.tableId }, { orderId: data.orderId }]
      },
      select: {
        table: true,
        expiresAt: true,
        qrCode: true,
        order: true
      }
    })

    if (existingTransaction) {
      // Kiểm tra nếu giao dịch chưa hết hạn thì trả về QR code cũ
      if (existingTransaction.expiresAt > new Date()) {
        const remainingTime = Math.max(
          0,
          existingTransaction.expiresAt.getTime() - new Date().getTime()
        )
        const totalRemainingSeconds = Math.floor(remainingTime / 1000)

        return {
          qrCode: existingTransaction.qrCode,
          order: existingTransaction.order,
          expiresAt: existingTransaction.expiresAt,
          totalRemainingSeconds: totalRemainingSeconds
        }
      } else {
        // Nếu đã hết hạn thì xóa giao dịch cũ và tạo mới
        await this.prisma.vNPayTransaction.deleteMany({
          where: {
            status: TransactionStatus.PENDING,
            OR: [{ tableId: data.tableId }, { orderId: data.orderId }],
            expiresAt: { lte: new Date() }
          }
        })
      }
    }

    let targetOrder = null

    if (!data.tableId && data.orderId) {
      const paymentMethod = await this.prisma.paymentMethod.findUnique({
        where: {
          type_branchId: { type: PaymentMethodType.VNPAY, branchId }
        }
      })

      // Nếu có đơn thì lấy thông tin đơn
      targetOrder = await this.prisma.order.update({
        where: { id: data.orderId, branchId },
        data: {
          paymentMethodId: paymentMethod.id
        }
      })
    } else {
      // Nếu không đơn thì tạo mới
      targetOrder = await this.createOrderByTableId(data, accountId, branchId)
    }

    const payload = this.buildVNPayPayload(
      merchantInfo,
      targetOrder.orderTotal.toString(),
      targetOrder.code
    )

    try {
      const response = await this.httpService.post(process.env.VNP_CREATE_QR, payload).toPromise()
      const qrData = response.data?.data
      if (!qrData) {
        throw new HttpException(`Không nhận được dữ liệu từ VNP!`, HttpStatus.NOT_FOUND)
      }

      // Tạo QR code image
      const qrCodeImage = await this.generateQrCodeImage(qrData)

      // Tạo vNPayTransaction với qrCode
      await this.prisma.vNPayTransaction.create({
        data: {
          branchId,
          orderId: targetOrder.id,
          tableId: data.tableId,
          vnpTxnRef: targetOrder.code,
          status: TransactionStatus.PENDING,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          qrCode: qrCodeImage
        }
      })

      // Tính totalRemainingSeconds cho QR code mới (10 phút = 600 giây)
      const totalRemainingSeconds = 10 * 60

      return {
        qrCode: qrCodeImage,
        order: targetOrder,
        totalRemainingSeconds: totalRemainingSeconds
      }
    } catch (error) {
      throw new HttpException(
        `Không thể tạo mã QR: ${error?.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async createOrderByTableId(data: CreateQrCodeDto, accountId: string, branchId: string) {
    if (!data.tableId && !data.orderId)
      throw new HttpException('Không thể truyền cả 2 tableId và orderId!', HttpStatus.BAD_REQUEST)

    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: {
        type_branchId: { type: PaymentMethodType.VNPAY, branchId }
      }
    })

    // Lấy danh sách món từ bàn
    const orderDetailsInTable = await this.prisma.orderDetail.findMany({
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

    return await this.prisma.$transaction(async prisma => {
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
          paymentStatus: PaymentStatus.UNPAID,
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
      desc: `Thanh toan don hang: #${txnId}`,
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

  async deleteTransaction(targetId: string, branchId: string) {
    // Xóa hết đơn nháp nếu thanh toán từ bàn
    await this.prisma.order.deleteMany({ where: { tableId: targetId, isDraft: true, branchId } })

    await this.prisma.vNPayTransaction.deleteMany({
      where: {
        OR: [{ tableId: targetId, orderId: targetId }],
        status: TransactionStatus.PENDING,
        branchId
      }
    })

    return
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

    // 3. Xác thực checksum theo định dạng VNPay QR
    const secretKey = process.env.VNP_IPN_SECRET_KEY
    const dataString = `${code}|${msgType}|${txnId}|${qrTrace}|${bankCode}|${mobile}|${accountNo || ''}|${amount}|${payDate}|${merchant.merchantCode}|${secretKey}`
    const validChecksum = crypto.createHash('md5').update(dataString).digest('hex').toUpperCase()

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

    // 4. Kiểm tra số tiền thanh toán có đúng không (amount từ VNPay IPN & orderTotal từ Order & orderDetails từ Table)
    const orderAmount = transaction.order.orderTotal
    const orderDetails = await this.prisma.orderDetail.findMany({
      where: { tableId: transaction.order.tableId }
    })

    const totalCurrentAmount = getOrderTotal(orderDetails)

    if (
      Number(ipnDto['amount']) !== orderAmount ||
      (transaction.order.tableId && totalCurrentAmount !== orderAmount)
    ) {
      return {
        code: '07',
        message: 'Số tiền không chính xác',
        data: { amount: orderAmount }
      }
    }

    // 5. Đơn đã thanh toán rồi
    if (transaction.order.paymentStatus === PaymentStatus.SUCCESS) {
      return {
        code: '05',
        message: 'Đơn hàng đã thanh toán rồi',
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
      await this.handlePaymentSuccess(this.prisma, transaction.orderId, transaction.branchId)

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

  private async handlePaymentSuccess(prisma: PrismaClient, orderId: string, branchId: string) {
    // Kiểm tra xem có setting sử dụng bếp hay không
    const branchSetting = await prisma.branchSetting.findUnique({
      where: {
        branchId
      }
    })

    await prisma.orderDetail.updateMany({
      where: { orderId },
      data: {
        tableId: null,
        orderId,
        ...(!branchSetting?.useKitchen && { status: OrderDetailStatus.SUCCESS })
      }
    })

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.SUCCESS, isDraft: false, paymentAt: new Date() },
      select: orderSelect
    })

    const promises = [
      this.orderGatewayHandler.handlePaymentSuccessfully(updatedOrder, updatedOrder.branchId)
    ]

    // Chỉ bắn handleUpdateTable khi có table
    if (updatedOrder.table) {
      promises.push(
        this.tableGatewayHandler.handleUpdateTable(updatedOrder.table, updatedOrder.branchId)
      )
    }

    await Promise.all(promises)
  }

  async paymentReviewing(
    data: PaymentReviewingOrderDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        const branchSetting = await prisma.branchSetting.findUniqueOrThrow({
          where: {
            branchId
          }
        })

        if (!branchSetting.useKitchen)
          await prisma.orderDetail.updateMany({
            where: { orderId: data.orderId, branchId },
            data: {
              status: OrderDetailStatus.SUCCESS,
              successAt: new Date()
            }
          })

        const order = await prisma.order.findUniqueOrThrow({
          where: {
            id: data.orderId
          },
          include: { paymentMethod: true }
        })

        if (order.paymentStatus === PaymentStatus.SUCCESS)
          throw new HttpException('Đơn hàng này đã thành toán!', HttpStatus.CONFLICT)

        if (order.paymentStatus === PaymentStatus.REVIEWING)
          throw new HttpException('Đơn hàng này đang được xem xét!', HttpStatus.CONFLICT)

        // Xử lý đặt món từ bàn
        if (order.type === OrderType.OFFLINE) {
          const orderDetailInTables = await this.prisma.orderDetail.findMany({
            where: { tableId: order.tableId },
            select: orderDetailSelect
          })

          const totalCurrentAmount = getOrderTotal(orderDetailInTables)

          if (order.orderTotal !== totalCurrentAmount)
            throw new HttpException(
              'Giao dịch thất bại. Vui lòng tạo lại giao dịch!',
              HttpStatus.CONFLICT
            )

          // Thực hiện bỏ món ra khỏi bàn
          await prisma.orderDetail.updateMany({
            where: { orderId: data.orderId, branchId },
            data: {
              tableId: null
            }
          })
        }

        // Kiểm tra số tiền trong đơn và bàn
        await prisma.vNPayTransaction.update({
          where: { orderId: data.orderId },
          data: {
            status: TransactionStatus.SUCCESS
          }
        })

        const updatedOrder = await prisma.order.update({
          where: { id: data.orderId },
          data: {
            paymentStatus: PaymentStatus.REVIEWING,
            paymentAt: new Date(),
            isDraft: false,
            note: data.note,
            updatedBy: accountId
          },
          select: orderSelect
        })

        const promises = [
          this.activityLogService.create(
            {
              action: ActivityAction.PAYMENT,
              modelName: 'Order',
              targetName: updatedOrder.code,
              targetId: updatedOrder.id
            },
            { branchId },
            accountId
          ),
          this.orderGatewayHandler.handleCreateOrder(updatedOrder, branchId, deviceId)
        ]

        // Chỉ bắn handleUpdateTable khi có table
        if (updatedOrder.table) {
          promises.push(
            this.tableGatewayHandler.handleUpdateTable(updatedOrder.table, branchId, deviceId)
          )
        }

        await Promise.all(promises)

        return updatedOrder
      },
      {
        timeout: 10_000,
        maxWait: 15_000
      }
    )
  }

  async getLatestPendingTransactionByTableId(tableId: string, branchId: string) {
    const transaction = await this.prisma.vNPayTransaction.findFirst({
      where: {
        tableId,
        branchId,
        status: TransactionStatus.PENDING
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        order: true,
        table: true
      }
    })

    if (!transaction) {
      throw new HttpException(
        'Không tìm thấy giao dịch VNPay đang chờ xử lý cho bàn này',
        HttpStatus.NOT_FOUND
      )
    }

    return transaction
  }
}
