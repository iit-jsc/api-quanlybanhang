import { IsNotEmpty, IsString } from 'class-validator'

export class CheckTransactionDto {
  @IsNotEmpty()
  @IsString()
  txnId: string

  @IsNotEmpty()
  @IsString()
  payDate: string
}
