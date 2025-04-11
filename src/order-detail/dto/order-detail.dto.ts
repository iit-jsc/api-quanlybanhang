import { OrderDetailStatus, OrderType } from '@prisma/client'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import { IsDate, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
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

  @IsOptional()
  @IsEnum(OrderDetailStatus)
  status: OrderDetailStatus
}

export class UpdateStatusOrderDetailsDto {
  @IsNotEmpty()
  ids: string[]

  @IsNotEmpty()
  @IsEnum(OrderDetailStatus)
  status?: OrderDetailStatus
}
