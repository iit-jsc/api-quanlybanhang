import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate
} from 'class-validator'
import { DISCOUNT_TYPE } from 'enums/common.enum'
import { DiscountConstraint } from 'utils/CustomValidates'

export class CreateCustomerTypeDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @IsEnum(DISCOUNT_TYPE, { message: 'Loại giảm giá không hợp lệ!' })
  discountType: number

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @Validate(DiscountConstraint)
  discount: number
}

export class UpdateCustomerTypeDto extends PartialType(CreateCustomerTypeDto) {}
