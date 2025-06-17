import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { CheckTransactionDto } from '../dto/check-transaction.dto'
import { MerchantService } from './merchant.service'
import { ChecksumService } from './checksum.service'

@Injectable()
export class CheckTransactionService {
  constructor(
    private readonly httpService: HttpService,
    private readonly merchantService: MerchantService,
    private readonly checksumService: ChecksumService
  ) {}

  async checkTransaction(dto: CheckTransactionDto, branchId: string) {
    // Lấy thông tin merchant từ bảng vNPayMerchant
    const merchant = await this.merchantService.getMerchantInfo(branchId)

    if (!merchant) {
      throw new HttpException('Merchant không hợp lệ', HttpStatus.BAD_REQUEST)
    }

    // Tính checksum
    const checksum = this.checksumService.generateCheckTransactionChecksum(
      dto.payDate,
      dto.txnId,
      merchant.merchantCode,
      merchant.terminalId,
      merchant.checkTransSecretKey
    )

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

      return response.data
    } catch (error) {
      throw new HttpException(
        error?.response?.data || error.message || 'Lỗi khi gọi đối tác VNPay',
        HttpStatus.BAD_GATEWAY
      )
    }
  }
}
