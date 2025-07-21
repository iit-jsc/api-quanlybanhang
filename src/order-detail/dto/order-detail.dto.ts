import { OrderDetailStatus, OrderType } from '@prisma/client'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class FindManyOrderDetailDto extends FindManyDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: OrderDetailStatus) => id?.trim())
  })
  @IsEnum(OrderDetailStatus, { each: true })
  statuses?: OrderDetailStatus[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: OrderType) => id?.trim())
  })
  @IsEnum(OrderType, { each: true })
  orderTypes?: OrderType[]

  @Transform(({ value }) => value?.toString().toLowerCase() === 'true')
  hasTable?: boolean
}

export class UpdateOrderDetailDto {
  @IsOptional()
  @Min(0)
  amount: number

  note?: string
}

export class OrderDetailAmount {
  @IsNotEmpty()
  id: string

  @IsNumber()
  @IsInt()
  @Min(0)
  amount: number
}
@ValidatorConstraint({ name: 'isNotApproved', async: false })
class IsNotApprovedConstraint implements ValidatorConstraintInterface {
  validate(status: any) {
    return status !== OrderDetailStatus.APPROVED
  }

  defaultMessage() {
    return 'Status không được là APPROVED'
  }
}

export class UpdateStatusOrderDetailsDto {
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderDetailAmount)
  orderDetails: OrderDetailAmount[]

  @IsNotEmpty()
  @IsEnum(OrderDetailStatus)
  @Validate(IsNotApprovedConstraint)
  status?: OrderDetailStatus
}

export class CancelOrderDetailsDto {
  @IsNumber()
  @Min(1)
  @IsInt()
  amount: number

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  cancelReason: string
}
