import { OrderStatus, OrderType } from '@prisma/client'
import { IsArray, IsEnum, IsNotEmpty, IsOptional, Min } from 'class-validator'

export class PaymentDto {
  @IsNotEmpty()
  paymentMethodId: string

  @IsOptional()
  @IsArray()
  bankingImages: string[]

  @IsOptional()
  @Min(1)
  moneyReceived: number

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus

  voucherId?: string
  discountCode?: string
  customerId?: string
  note?: string
}

export class PaymentOrderDto extends PaymentDto {
  @IsNotEmpty()
  @IsEnum(OrderType)
  type: OrderType
}

export class PaymentFromTableDto extends PaymentDto {
  totalPeople?: number

  code?: string
}

export class RequestPaymentDto {
  @IsNotEmpty()
  branchId: string
}
