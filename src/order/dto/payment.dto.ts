import { OrderStatus, OrderType, PaymentStatus } from '@prisma/client'
import { ArrayMaxSize, IsArray, IsEnum, IsNotEmpty, IsOptional, Min } from 'class-validator'

export class PaymentDto {
  @IsNotEmpty()
  paymentMethodId: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1)
  bankingImages: string[]

  @IsOptional()
  @Min(1)
  moneyReceived: number

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus

  customerId?: string
  note?: string
}

export class PaymentOrderDto extends PaymentDto {
  @IsNotEmpty()
  @IsEnum(OrderType)
  type: OrderType
}

export class PaymentReviewingOrderDto {
  note?: string

  @IsNotEmpty()
  orderId: string
}

export class PaymentFromTableDto extends PaymentDto {
  totalPeople?: number

  code?: string
}

export class RequestPaymentDto {
  @IsNotEmpty()
  branchId: string
}

export class UpdatePaymentDto {
  paymentStatus?: PaymentStatus
}
