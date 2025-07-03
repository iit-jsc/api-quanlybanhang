import { PartialType } from '@nestjs/swagger'
import { DiscountType } from '@prisma/client'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator'
import { DiscountConstraint } from 'utils/CustomValidates'

export class CreateCustomerTypeDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string

  @IsOptional()
  @IsEnum(DiscountType)
  discountType: DiscountType

  @IsOptional()
  @Validate(DiscountConstraint)
  discount?: number

  description?: string
}

export class UpdateCustomerTypeDto extends PartialType(CreateCustomerTypeDto) {}
