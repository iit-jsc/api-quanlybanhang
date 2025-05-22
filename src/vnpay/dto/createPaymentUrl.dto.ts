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
