import { IsNotEmpty } from 'class-validator'

export class VNPayIPNDto {
  @IsNotEmpty()
  txnId: string

  @IsNotEmpty()
  payDate: string

  @IsNotEmpty()
  responseCode: string

  @IsNotEmpty()
  checksum: string
}
