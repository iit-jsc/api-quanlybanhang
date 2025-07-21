import { PartialType } from '@nestjs/swagger'
import { DiscountType } from '@prisma/client'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, Validate } from 'class-validator'
import { DiscountConstraint } from 'utils/CustomValidates'

export class CreateCustomerTypeDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MaxLength(50)
  name: string

  @IsOptional()
  @IsEnum(DiscountType)
  discountType: DiscountType

  @IsOptional()
  @Validate(DiscountConstraint)
  discount: number

  @IsOptional()
  @IsString()
  description: string
}

export class UpdateCustomerTypeDto extends PartialType(CreateCustomerTypeDto) {}
