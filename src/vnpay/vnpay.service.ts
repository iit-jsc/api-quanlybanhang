import * as crypto from 'crypto'
import * as QRCode from 'qrcode'
import * as moment from 'moment'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { PrismaService } from 'nestjs-prisma'
import { SetupMerchantDto } from './dto/merchant.dto'
import {
  ActivityAction,
  Order,
  OrderDetailStatus,
  OrderType,
  PaymentMethodType,
  PaymentStatus,
  PrismaClient,
  TaxApplyMode,
  TransactionStatus
} from '@prisma/client'
import { CreateQrCodeDto } from './dto/qrCode.dto'
import { CheckTransactionDto } from './dto/check-transaction.dto'
import { VNPayIPNDto } from './dto/vnpay-ipn.dto'
import { generateCode, getOrderTotal } from 'helpers'
import { orderSelect } from 'responses/order.response'
import { TableGatewayHandler } from 'src/gateway/handlers/table.handler'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'
import { decrypt, encrypt } from 'utils/encrypt'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { PaymentReviewingOrderDto } from 'src/order/dto/payment.dto'
import { orderDetailSelect } from 'responses/order-detail.response'
import { MAX_WAIT, TIMEOUT } from 'enums/common.enum'
import { calculateTax } from 'helpers/tax.helper'

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
  async generateQrCode(
    data: CreateQrCodeDto,
    branchId: string,
    accountId: string,
    deviceId: string
  ) {
    if (data.tableId && data.orderId) {
      throw new HttpException(
        `Chỉ được cung cấp một trong hai: tableId hoặc orderId!`,
        HttpStatus.BAD_REQUEST
      )
    }

    const merchantInfo = await this.getMerchantInfo(branchId)

    if (!merchantInfo) {
      throw new HttpException(
        `Không tìm thấy thông tin merchant cho branchId: ${branchId}`,
        HttpStatus.NOT_FOUND
      )
    }

    // Kiểm tra và xử lý giao dịch đang tồn tại
    const existingQrResponse = await this.handleExistingTransaction(data, branchId)
    if (existingQrResponse) {
      return existingQrResponse
    }

    // Tạo hoặc lấy đơn hàng
    const targetOrder = await this.getOrCreateOrder(data, accountId, branchId)

    // Tạo QR code mới
    return this.createNewQrCode(merchantInfo, targetOrder, data, branchId, deviceId)
  }

  /**
   * Kiểm tra và xử lý giao dịch đang tồn tại
   */
  private async handleExistingTransaction(
    data: CreateQrCodeDto,
    branchId: string
  ): Promise<any | null> {
    const existingTransaction = await this.findExistingTransaction(data)

    if (!existingTransaction) {
      return null
    }

    // Nếu đã hết hạn, xóa và tạo mới
    if (existingTransaction.expiresAt <= new Date()) {
      await this.cleanupExpiredTransactions(data)
      return null
    }

    // Kiểm tra số tiền thay đổi (chỉ cho order tại bàn)
    if (existingTransaction.table && data.tableId) {
      const shouldRecreate = await this.shouldRecreateQrForTable(
        data.tableId,
        branchId,
        existingTransaction.order.orderTotal
      )

      if (shouldRecreate) {
        await this.cleanupTransactionsByTable(data.tableId, branchId)
        return null
      }
    }

    // Trả về QR code cũ
    return this.buildQrResponse(existingTransaction)
  }

  /**
   * Tìm giao dịch đang tồn tại
   */
  private async findExistingTransaction(data: CreateQrCodeDto) {
    return this.prisma.vNPayTransaction.findFirst({
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
  }

  /**
   * Kiểm tra có nên tạo lại QR cho bàn không
   */
  private async shouldRecreateQrForTable(
    tableId: string,
    branchId: string,
    existingOrderTotal: number
  ): Promise<boolean> {
    const currentOrderDetails = await this.prisma.orderDetail.findMany({
      where: { tableId, branchId },
      select: {
        id: true,
        amount: true,
        note: true,
        status: true,
        product: true,
        productOriginId: true,
        productOptions: true
      }
    })

    const currentTableTotal = getOrderTotal(currentOrderDetails)
    return currentTableTotal !== existingOrderTotal
  }

  /**
   * Xóa giao dịch hết hạn
   */
  private async cleanupExpiredTransactions(data: CreateQrCodeDto) {
    await this.prisma.vNPayTransaction.deleteMany({
      where: {
        status: TransactionStatus.PENDING,
        OR: [{ tableId: data.tableId }, { orderId: data.orderId }],
        expiresAt: { lte: new Date() }
      }
    })
  }

  /**
   * Xóa giao dịch và đơn nháp theo bàn
   */
  private async cleanupTransactionsByTable(tableId: string, branchId: string) {
    await Promise.all([
      this.prisma.vNPayTransaction.deleteMany({
        where: {
          status: TransactionStatus.PENDING,
          tableId
        }
      }),
      this.prisma.order.deleteMany({
        where: {
          tableId,
          isDraft: true,
          branchId
        }
      })
    ])
  }

  /**
   * Tạo response cho QR code
   */
  private buildQrResponse(existingTransaction: any) {
    const remainingTime = Math.max(
      0,
      existingTransaction.expiresAt.getTime() - new Date().getTime()
    )
    const totalRemainingSeconds = Math.floor(remainingTime / 1000)

    return {
      qrCode: existingTransaction.qrCode,
      order: existingTransaction.order,
      expiresAt: existingTransaction.expiresAt,
      totalRemainingSeconds
    }
  }

  /**
   * Lấy hoặc tạo đơn hàng
   */
  private async getOrCreateOrder(data: CreateQrCodeDto, accountId: string, branchId: string) {
    if (!data.tableId && data.orderId) {
      // Cập nhật đơn hàng có sẵn
      const paymentMethod = await this.prisma.paymentMethod.findUnique({
        where: {
          type_branchId: { type: PaymentMethodType.VNPAY, branchId }
        }
      })

      return this.prisma.order.update({
        where: { id: data.orderId, branchId },
        data: {
          paymentMethodId: paymentMethod.id
        }
      })
    }

    // Tạo đơn hàng mới từ bàn
    return this.createOrderByTableId(data, accountId, branchId)
  }

  /**
   * Tạo QR code mới
   */
  private async createNewQrCode(
    merchantInfo: MerchantInfo,
    targetOrder: Order,
    data: CreateQrCodeDto,
    branchId: string,
    deviceId: string
  ) {
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

      const qrCodeImage = await this.generateQrCodeImage(qrData)

      // Lưu giao dịch mới
      await this.prisma.vNPayTransaction.create({
        data: {
          branchId,
          orderId: targetOrder.id,
          tableId: data.tableId,
          vnpTxnRef: targetOrder.code,
          status: TransactionStatus.PENDING,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          qrCode: qrCodeImage,
          deviceId
        }
      })

      return {
        qrCode: qrCodeImage,
        order: targetOrder,
        totalRemainingSeconds: 10 * 60 // 10 phút
      }
    } catch (error) {
      throw new HttpException(
        `Không thể tạo mã QR: ${error?.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async createOrderByTableId(data: CreateQrCodeDto, accountId: string, branchId: string) {
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id: branchId },
      select: {
        branchSetting: true,
        taxSetting: true,
        paymentMethods: {
          where: {
            type: PaymentMethodType.VNPAY
          }
        }
      }
    })

    let totalTax = 0
    let totalTaxDiscount = 0
    let isTaxTrulyIncluded = false
    const { taxSetting, branchSetting } = branch
    const paymentMethod = branch.paymentMethods[0]

    if (!branchSetting.useKitchen) {
      await this.prisma.orderDetail.updateMany({
        where: { tableId: data.tableId, branchId },
        data: {
          status: OrderDetailStatus.SUCCESS,
          successAt: new Date()
        }
      })
    }

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
    const orderTotalWithDiscount = orderTotalNotDiscount - data.discountValue

    if (orderTotalNotDiscount < data.discountValue)
      throw new HttpException('Giá trị giảm giá không hợp lệ!', HttpStatus.BAD_REQUEST)

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
          orderDetailsInTable,
          orderTotalWithDiscount
        ))

        // Kiểm tra xem thuế có thực sự được áp dụng hay không
        isTaxTrulyIncluded = true
      }
    }
    return await this.prisma.order.create({
      data: {
        isDraft: true,
        totalTax,
        totalTaxDiscount,
        discountValue: data.discountValue,
        tableId: data.tableId,
        orderTotal: orderTotalWithDiscount,
        code: data.code || generateCode('DH', 15),
        type: OrderType.OFFLINE,
        createdBy: accountId,
        branchId,
        paymentMethodId: paymentMethod?.id,
        customerId: data.customerId,
        orderDetails: {
          connect: orderDetailsInTable.map(od => ({ id: od.id }))
        },
        isTaxApplied: isTaxTrulyIncluded
      }
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
      where: { tableId: transaction.order.tableId, branchId: transaction.order.branchId }
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
      await this.handlePaymentSuccess(transaction.orderId, transaction.branchId)

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

  private async handlePaymentSuccess(orderId: string, branchId: string) {
    // Kiểm tra xem có setting sử dụng bếp hay không
    const branchSetting = await this.prisma.branchSetting.findUnique({
      where: {
        branchId
      }
    })

    await this.prisma.orderDetail.updateMany({
      where: { orderId },
      data: {
        tableId: null,
        orderId,
        ...(!branchSetting?.useKitchen && { status: OrderDetailStatus.SUCCESS })
      }
    })

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.SUCCESS, isDraft: false, paymentAt: new Date() },
      select: orderSelect
    })

    const promises = [this.orderGatewayHandler.handlePaymentSuccessfully(updatedOrder, branchId)]

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
          throw new HttpException('Đơn hàng này đã thanh toán!', HttpStatus.CONFLICT)

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
        timeout: TIMEOUT,
        maxWait: MAX_WAIT
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
