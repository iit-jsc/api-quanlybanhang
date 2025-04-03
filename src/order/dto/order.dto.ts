import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator'
import { OrderDetailStatus, OrderStatus, OrderType } from '@prisma/client'
import { FindManyDto } from 'utils/Common.dto'

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

  @IsOptional()
  @IsEnum(OrderDetailStatus)
  status: OrderDetailStatus

  productOptionIds?: string[]
}

export class UpdateOrderDto {
  bankingImages?: string[]
  note?: string

  @IsOptional()
  @IsEnum(OrderDetailStatus)
  status: OrderDetailStatus
}

export class CancelOrderDto {
  cancelReason?: string
}

export class FindManyOrderDto extends FindManyDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.split(',').map((id: string) => id.trim())
    }
    return Array.isArray(value) ? value : []
  })
  @IsArray()
  @IsEnum(OrderType, { each: true })
  types: OrderType[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.split(',').map((id: string) => id.trim())
    }
    return Array.isArray(value) ? value : []
  })
  @IsArray()
  @IsEnum(OrderStatus, { each: true })
  statuses: OrderStatus[]

  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value)
  })
  isPaid?: boolean

  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value)
  })
  isSave?: boolean

  customerId?: string
}

export class SaveOrderDto {
  note?: string

  @IsBoolean()
  isSave: boolean
}

export class SeparateTableDto {
  @IsNotEmpty()
  @IsString()
  toTableId: string

  @IsNotEmpty()
  @ArrayNotEmpty()
  orderDetailIds: string[]
}
