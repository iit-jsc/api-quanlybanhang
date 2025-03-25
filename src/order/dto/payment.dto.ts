import { OrderStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, Min } from 'class-validator'

export class PaymentFromTableDto {
  @IsNotEmpty()
  tableId: string

  @IsNotEmpty()
  paymentMethodId: string

  @IsNotEmpty()
  @IsEnum(OrderStatus)
  orderStatus: OrderStatus

  @IsOptional()
  @Min(1)
  moneyReceived: number

  customerId?: string
  note?: string
  bankingImages?: string[]
  discountCode?: string
  promotionId?: string
}
