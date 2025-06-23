import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'
import { OrderDetailStatus, OrderStatus, OrderType, PaymentStatus } from '@prisma/client'
import { FindManyDto } from 'utils/Common.dto'

@ValidatorConstraint({ name: 'isNotCancel', async: false })
export class IsNotCancelConstraint implements ValidatorConstraintInterface {
  validate(status: OrderStatus) {
    return status !== OrderStatus.CANCELLED
  }

  defaultMessage() {
    return 'Không thể cập nhật trạng thái hủy!'
  }
}
export class CreateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus

  @IsOptional()
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
  cancelReason?: string

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus

  @IsOptional()
  @IsEnum(OrderStatus)
  @Validate(IsNotCancelConstraint)
  status: OrderStatus
}

export class CancelOrderDto {
  cancelReason?: string
}

export class FindManyOrderDto extends FindManyDto {
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

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus

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

export class OrderDetailSeparateDto {
  @IsNotEmpty()
  id: string

  @IsNumber()
  @Min(0)
  amount: number
}
export class SeparateTableDto {
  @IsNotEmpty()
  toTableId: string

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderDetailSeparateDto)
  orderDetails: OrderDetailSeparateDto[]
}
