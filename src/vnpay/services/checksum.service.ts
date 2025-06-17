import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import * as moment from 'moment'
import { MerchantInfo } from './merchant.service'

@Injectable()
export class ChecksumService {
  buildVNPayPayload(merchantInfo: MerchantInfo, amount: string, txnId: string) {
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

  generateCheckTransactionChecksum(
    payDate: string,
    txnId: string,
    merchantCode: string,
    terminalId: string,
    secretKey: string
  ): string {
    const dataString = `${payDate}|${txnId}|${merchantCode}|${terminalId}|${secretKey}`
    return crypto.createHash('md5').update(dataString).digest('hex').toLowerCase()
  }

  generateIPNChecksum(
    code: string,
    msgType: string,
    txnId: string,
    qrTrace: string,
    bankCode: string,
    mobile: string,
    accountNo: string,
    amount: string,
    payDate: string,
    merchantCode: string,
    secretKey: string
  ): string {
    const dataString = `${code}|${msgType}|${txnId}|${qrTrace}|${bankCode}|${mobile}|${accountNo || ''}|${amount}|${payDate}|${merchantCode}|${secretKey}`
    return crypto.createHash('md5').update(dataString).digest('hex').toUpperCase()
  }
}
