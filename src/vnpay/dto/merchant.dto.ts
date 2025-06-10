import { IsNotEmpty } from 'class-validator'

export class SetupMerchantDto {
  @IsNotEmpty()
  merchantName: string

  @IsNotEmpty()
  secretKey: string

  @IsNotEmpty()
  terminalId: string

  @IsNotEmpty()
  merchantType: string

  @IsNotEmpty()
  merchantCode: string
}
