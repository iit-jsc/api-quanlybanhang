import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { DISCOUNT_TYPE } from 'enums/common.enum';
import { DiscountConstraint } from 'utils/CustomValidates';

export class CreateCustomerTypeDTO {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @IsEnum(DISCOUNT_TYPE, { message: 'Loại giảm giá không hợp lệ!' })
  type: number;

  @IsOptional()
  @IsNumber()
  @Validate(DiscountConstraint)
  discount: number;
}
