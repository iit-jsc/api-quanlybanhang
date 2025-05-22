import { Injectable } from '@nestjs/common'
import * as moment from 'moment'
import * as crypto from 'crypto'
import { vnpayConfig } from '../../config/vnpay.config'
import * as qs from 'qs'
import { PrismaService } from 'nestjs-prisma'
import { CreatePaymentDto } from './dto/createPaymentUrl.dto'

export interface VnpayParams {
  [key: string]: any
}

@Injectable()
export class VnpayService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createPaymentUrl(data: CreatePaymentDto, ipAddr: string): Promise<string> {
    process.env.TZ = 'Asia/Ho_Chi_Minh'

    const date = new Date()
    const createDate = moment(date).format('YYYYMMDDHHmmss')
    const orderId = moment(date).format('DDHHmmss')
    const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss')

    const tmnCode = vnpayConfig.VNP_TMN_CODE
    const secretKey = vnpayConfig.VNP_HASH_SECRET
    const vnpUrl = vnpayConfig.VNP_URL
    const returnUrl = vnpayConfig.VNP_RETURN_URL

    let ipAddrV4 = ipAddr
    if (ipAddrV4 === '::1') ipAddrV4 = '127.0.0.1'

    const vnp_Params: VnpayParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan cho ma GD:${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: 10000 * 100,
      vnp_ReturnUrl: returnUrl,
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
    console.log(finalUrl)

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
}
