import { OrderType, PaymentStatus } from '@prisma/client'
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator'

export class PaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentMethodId: string

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1)
  bankingImages: string[]

  @IsOptional()
  @Min(1)
  @IsNumber()
  moneyReceived: number

  @IsOptional()
  @IsString()
  customerId: string

  @IsOptional()
  @IsString()
  note: string
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
  @IsOptional()
  @IsBoolean()
  isTaxApplied: boolean = false
}

export class RequestPaymentDto {
  @IsNotEmpty()
  branchId: string
}

export class UpdatePaymentDto {
  paymentStatus?: PaymentStatus
}
