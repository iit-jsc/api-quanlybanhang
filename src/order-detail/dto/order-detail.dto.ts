import { OrderDetailStatus, OrderType } from '@prisma/client'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested
} from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class FindManyOrderDetailDto extends FindManyDto {
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: OrderDetailStatus) => id)
  })
  statuses?: OrderDetailStatus[]

  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: OrderType) => id)
  })
  orderTypes?: OrderType[]

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date

  @Transform(({ value }) => value?.toString().toLowerCase() === 'true')
  hasTable?: boolean
}

export class UpdateOrderDetailDto {
  amount?: number

  note?: string
}

export class OrderDetailAmount {
  @IsNotEmpty()
  id: string

  @IsNumber()
  @Min(0)
  amount: number
}

export class UpdateStatusOrderDetailsDto {
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderDetailAmount)
  orderDetails: OrderDetailAmount[]

  @IsNotEmpty()
  @IsEnum(OrderDetailStatus)
  status?: OrderDetailStatus
}

export class CancelOrderDetailsDto {
  @IsNumber()
  @Min(1)
  amount: number

  cancelReason?: string
}
