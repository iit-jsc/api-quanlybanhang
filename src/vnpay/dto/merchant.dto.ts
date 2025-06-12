import { IsNotEmpty } from 'class-validator'

export class SetupMerchantDto {
  @IsNotEmpty()
  branchId: string

  @IsNotEmpty()
  merchantName: string

  @IsNotEmpty()
  terminalId: string

  @IsNotEmpty()
  merchantType: string

  @IsNotEmpty()
  merchantCode: string

  genQRSecretKey: string
  checkTransSecretKey: string
  refundSecretKey: string
}
