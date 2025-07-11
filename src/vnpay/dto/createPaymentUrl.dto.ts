import { IsNotEmpty } from 'class-validator'

export class CreatePaymentDto {
  @IsNotEmpty()
  amount: number

  @IsNotEmpty()
  orderCode: string

  @IsNotEmpty()
  orderId: string

  @IsNotEmpty()
  returnUrl: string
}

export class CreateConfigDto {
  @IsNotEmpty()
  vnpTmnCode: string

  @IsNotEmpty()
  vnpHashSecret: string

  @IsNotEmpty()
  branchId: string
}
