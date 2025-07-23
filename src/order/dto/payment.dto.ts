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
import { Transform } from 'class-transformer'

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
  @Transform(({ value }) => Math.round(Number(value)))
  moneyReceived: number

  @IsOptional()
  @IsString()
  customerId: string

  @IsOptional()
  @IsString()
  note: string

  @IsOptional()
  @IsBoolean()
  isTaxApplied: boolean = false

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Math.round(Number(value)))
  discountValue: number = 0
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

export class PaymentFromTableDto extends PaymentDto {}

export class RequestPaymentDto {
  @IsNotEmpty()
  branchId: string
}

export class UpdatePaymentDto {
  paymentStatus?: PaymentStatus
}
