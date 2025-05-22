import * as moment from 'moment'
import * as crypto from 'crypto'
import * as qs from 'qs'
import { Request, Response } from 'express'
import { Injectable } from '@nestjs/common'
import { vnpayConfig } from '../../config/vnpay.config'
import { PrismaService } from 'nestjs-prisma'
import { CreatePaymentDto } from './dto/createPaymentUrl.dto'
import { PrismaClient } from '@prisma/client'
import { TableGatewayHandler } from 'src/gateway/handlers/table.handler'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'
import { accountShortSelect } from 'responses/account.response'
import { tableSelect } from 'responses/table.response'

export interface VnpayParams {
  [key: string]: any
}

@Injectable()
export class VnpayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tableGatewayHandler: TableGatewayHandler,
    private readonly orderGatewayHandler: OrderGatewayHandler
  ) {}

  private sortObject(obj: any) {
    const sorted = {}
    const str = []
    let key
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key))
      }
    }
    str.sort()
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
    }
    return sorted
  }

  async createPaymentUrl(
    data: CreatePaymentDto,
    ipAddr: string,
    prisma: PrismaClient
  ): Promise<string> {
    process.env.TZ = 'Asia/Ho_Chi_Minh'

    const date = new Date()
    const createDate = moment(date).format('YYYYMMDDHHmmss')
    const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss')

    const tmnCode = vnpayConfig.VNP_TMN_CODE
    const secretKey = vnpayConfig.VNP_HASH_SECRET
    const vnpUrl = vnpayConfig.VNP_URL

    let ipAddrV4 = ipAddr
    if (ipAddrV4 === '::1') ipAddrV4 = '127.0.0.1'

    const vnp_Params: VnpayParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: data.orderCode,
      vnp_OrderInfo: `Thanh toan DH: ${data.orderCode}`,
      vnp_OrderType: 'other',
      vnp_Amount: data.amount * 100,
      vnp_ReturnUrl: data.returnUrl,
      vnp_IpAddr: ipAddrV4,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate
    }

    Object.keys(vnp_Params).forEach(key => {
      if (vnp_Params[key] === undefined || vnp_Params[key] === null || vnp_Params[key] === '') {
        delete vnp_Params[key]
      }
    })

    const sortedParams = this.sortObject(vnp_Params)
    const signData = qs.stringify(sortedParams, { encode: false })
    const hmac = crypto.createHmac('sha512', secretKey)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    sortedParams['vnp_SecureHash'] = signed
    const finalUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: false })}`

    await prisma.vnpayTransaction.create({
      data: {
        vnpTxnRef: data.orderCode,
        orderId: data.orderId,
        orderCode: data.orderCode
      }
    })

    return finalUrl
  }

  verifyReturn(vnp_Params: any, secureHash: string): boolean {
    const sortedParams = this.sortObject(vnp_Params)
    const signData = qs.stringify(sortedParams, { encode: false })
    // Lấy thuật toán hash từ vnp_SecureHashType nếu có
    const hashType = vnp_Params['vnp_SecureHashType'] === 'HMACSHA256' ? 'sha256' : 'sha512'
    const hmac = crypto.createHmac(hashType, vnpayConfig.VNP_HASH_SECRET)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    return secureHash === signed
  }

  async vnpayIpn(req: Request, res: Response) {
    const vnp_Params = { ...req.query }
    const secureHash = vnp_Params['vnp_SecureHash'] as string
    const rspCode = vnp_Params['vnp_ResponseCode']
    let vnpTxnRef = vnp_Params['vnp_TxnRef']

    // Đảm bảo vnpTxnRef là string
    if (Array.isArray(vnpTxnRef)) vnpTxnRef = vnpTxnRef[0]
    if (typeof vnpTxnRef !== 'string') vnpTxnRef = String(vnpTxnRef)

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    // Xác thực checksum
    if (!this.verifyReturn(vnp_Params, secureHash)) {
      return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' })
    }

    try {
      await this.prisma.$transaction(async (tx: PrismaClient) => {
        const vnpayTransaction = await tx.vnpayTransaction.findUnique({
          where: { vnpTxnRef },
          include: {
            order: true
          }
        })
        if (!vnpayTransaction) {
          return res.status(200).json({ RspCode: '01', Message: 'Order not found' })
        }
        const order = vnpayTransaction.order
        const amountValid = order?.orderTotal === Number(vnp_Params['vnp_Amount']) / 100
        if (!amountValid) {
          return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' })
        }
        const orderId = vnpayTransaction.orderId

        // Thanh toán thành công
        if (rspCode === '00') {
          await this.handlePaymentSuccess(tx, orderId)
          return res.status(200).json({ RspCode: '00', Message: 'Success' })
        }
        // Hủy thanh toán từ merchant
        if (rspCode === '24') {
          await this.handlePaymentCancel(tx, orderId)
          return res.status(200).json({ RspCode: '24', Message: 'Order cancelled' })
        }
        // Thanh toán thất bại
        return res.status(200).json({ RspCode: '97', Message: 'Fail merchant' })
      })
    } catch (error: any) {
      console.error('VNPay IPN error:', error)
      return res
        .status(500)
        .json({ RspCode: '99', Message: 'Internal server error', error: error.message })
    }
  }

  private async handlePaymentSuccess(prisma: PrismaClient, orderId: string) {
    await prisma.orderDetail.updateMany({
      where: { orderId },
      data: { tableId: null, orderId }
    })

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { isPaid: true, paymentAt: new Date() },
      include: {
        table: {
          select: tableSelect
        },
        paymentMethod: true,
        creator: {
          select: accountShortSelect
        },
        updater: {
          select: accountShortSelect
        }
      }
    })

    await Promise.all([
      this.tableGatewayHandler.handleUpdateTable(updatedOrder.table, updatedOrder.branchId),
      this.orderGatewayHandler.handleUpdateOrder(updatedOrder, updatedOrder.branchId)
    ])
  }

  private async handlePaymentCancel(prisma: PrismaClient, orderId: string) {
    await prisma.orderDetail.updateMany({
      where: { orderId },
      data: { orderId: null }
    })

    const deletedOrder = await prisma.order.delete({
      where: { id: orderId }
    })

    await this.orderGatewayHandler.handleDeleteOrder(deletedOrder, deletedOrder.branchId)
  }
}
