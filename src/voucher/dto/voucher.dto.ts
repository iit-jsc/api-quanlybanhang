import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Max,
  MinDate,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'
import {
  ConditionOperator,
  DiscountType,
  VoucherConditionType,
  VoucherProductType,
  VoucherType
} from '@prisma/client'

export class CreateVoucherDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  amount: number

  @IsNotEmpty()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  startDate: Date

  @ValidateIf(o => o.type === VoucherType.VALUE)
  @IsNotEmpty()
  @ValidateIf(o => o.discountType === DiscountType.PERCENT)
  @Max(100)
  discount: number

  @ValidateIf(o => o.type === VoucherType.VALUE)
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType

  @IsNotEmpty()
  @IsEnum(VoucherType)
  type: VoucherType

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VoucherConditionGroupDto)
  conditionGroups: VoucherConditionGroupDto[]

  @IsOptional()
  @ValidateIf(o => o.type === VoucherType.PRODUCT)
  @ValidateNested({ each: true })
  @Type(() => VoucherProductDto)
  voucherProducts: VoucherProductDto[]

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  @MinDate(new Date(new Date().setDate(new Date().getDate() - 1)))
  endDate: Date

  @IsNotEmpty()
  @IsEnum(ConditionOperator)
  operator: ConditionOperator

  code?: string
  maxValue?: number
  description?: string
  isActive?: boolean
}

export class VoucherConditionGroupDto {
  @IsNotEmpty()
  @IsEnum(ConditionOperator)
  operator: ConditionOperator

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VoucherConditionDto)
  conditions: VoucherConditionDto[]
}

export class VoucherConditionDto {
  @IsNotEmpty()
  @IsEnum(VoucherConditionType)
  type: VoucherConditionType

  @ValidateIf(o => o.type === VoucherConditionType.MIN_PRODUCT_QUANTITY)
  @IsNotEmpty()
  productId: string

  @ValidateIf(o => o.type === VoucherConditionType.MIN_PRODUCT_QUANTITY)
  @IsNotEmpty()
  minQuantity: number

  @ValidateIf(o => o.type === VoucherConditionType.MIN_CUSTOMER)
  @IsNotEmpty()
  minCustomer: number

  @ValidateIf(o => o.type === VoucherConditionType.MIN_ORDER_TOTAL)
  @IsNotEmpty()
  minOrderTotal: number
}

export class VoucherProductDto {
  @IsNotEmpty()
  @IsEnum(VoucherProductType)
  type: VoucherProductType

  @ValidateIf(o => o.type !== VoucherProductType.DISCOUNT_PRODUCT)
  @IsNotEmpty()
  amount: number

  @ValidateIf(o => o.type === VoucherProductType.DISCOUNT_PRODUCT)
  @IsNotEmpty()
  limitQuantity: number

  @ValidateIf(o => o.type === VoucherProductType.DISCOUNT_PRODUCT)
  @IsNotEmpty()
  promotionalPrice: number

  @ValidateIf(o => o.type === VoucherProductType.SHOP_PRODUCT)
  @IsNotEmpty()
  productId?: string

  @ValidateIf(o => o.type === VoucherProductType.OTHER_PRODUCT)
  @IsNotEmpty()
  name: string

  @ValidateIf(o => o.type === VoucherProductType.OTHER_PRODUCT)
  @IsNotEmpty()
  photoURL: string
}

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {}

export class FindManyVoucherDto extends FindManyDto {
  @IsNotEmpty()
  branchId: string

  @Transform(({ value }) => value?.toString().toLowerCase() === 'true')
  isActive: boolean

  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((value: string) => value)
  })
  types?: VoucherType[]

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date
}

export class OrderProductDto {
  @IsNotEmpty()
  productId: string

  @IsNotEmpty()
  amount: number
}
