import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { SetupMerchantDto } from '../dto/merchant.dto'
import { decrypt, encrypt } from 'utils/encrypt'

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
export class MerchantService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getMerchantInfo(branchId: string): Promise<MerchantInfo> {
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
}
