import { PartialType } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinDate,
} from 'class-validator';
import { DISCOUNT_TYPE } from 'enums/common.enum';

export class CreateDiscountIssueDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  code: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Type(() => Number)
  @IsEnum(DISCOUNT_TYPE, { message: 'Giảm giá không hợp lệ!' })
  type: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  value: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  @MinDate(new Date(), { message: 'Ngày tháng phải lớn hơn ngày hiện tại!' })
  startDate: Date;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  @MinDate(new Date(), { message: 'Ngày tháng phải lớn hơn ngày hiện tại!' })
  endDate: Date;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value);
  })
  isEndDateDisabled: boolean;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  amount: number;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value);
  })
  isLimit: boolean;
}

export class UpdateDiscountIssueDto extends PartialType(
  CreateDiscountIssueDto,
) {}
