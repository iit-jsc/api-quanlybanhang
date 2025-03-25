import { FindManyDto } from 'utils/Common.dto'
import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateNested
} from 'class-validator'
import { OrderDetailStatus, OrderStatus, OrderType } from '@prisma/client'

export class CreateOrderDto {
  @IsOptional()
  @IsEnum(OrderDetailStatus)
  status: OrderDetailStatus

  @IsNotEmpty()
  @IsEnum(OrderType)
  type: OrderType

  @IsNotEmpty()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProductsDto)
  orderProducts: CreateOrderProductsDto[]

  code?: string
  customerId?: string
  note?: string
}

export class CreateOrderProductsDto {
  @IsNotEmpty()
  productId: string

  @IsNotEmpty()
  amount: number

  note?: string
  productOptionIds?: string[]
}

// export class UpdateOrderDto extends PartialType(CreateOrderDto) {
//   cancelReason?: string
//   paymentMethodId?: string
//   bankingImages?: string[]
// }

// export class PaymentOrderDto {
//   @IsNotEmpty()
//   paymentMethodId: string

//   @IsNotEmpty()
//   @IsEnum(OrderType)
//   orderType: OrderType

//   @IsOptional()
//   @Min(1)
//   exchangePoint: number

//   @IsOptional()
//   @IsArray()
//   bankingImages: string[]

//   @IsOptional()
//   @Min(1)
//   moneyReceived: number

//   @IsOptional()
//   @IsEnum(OrderStatus)
//   orderStatus: OrderStatus

//   promotionId?: string
//   discountCode?: string
//   customerId?: string
//   note?: string
// }

// export class FindManyOrderDto extends FindManyDto {
//   @IsOptional()
//   @Type(() => Date)
//   @IsDate()
//   from?: Date

//   @IsOptional()
//   @Type(() => Date)
//   @IsDate()
//   to?: Date

//   @Transform(({ value }: TransformFnParams) => {
//     return value?.split(',').map((id: number) => +id)
//   })
//   orderTypes: number[]

//   @Transform(({ value }: TransformFnParams) => {
//     return value?.split(',').map((id: number) => +id)
//   })
//   orderStatuses: number[]

//   customerId?: string

//   @Transform(({ value }: TransformFnParams) => {
//     return Boolean(+value)
//   })
//   isPaid?: boolean

//   @Transform(({ value }: TransformFnParams) => {
//     return Boolean(+value)
//   })
//   isSave?: boolean
// }
