import { PartialType } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MinDate,
  ValidateIf,
  ValidationArguments,
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
  discountType: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @ValidateIf((o) => o.discountType === DISCOUNT_TYPE.PERCENT)
  @Max(100)
  discount: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  @MinDate(new Date(new Date().setDate(new Date().getDate() - 1)), {
    message: 'Ngày tháng phải lớn hơn hoặc bằng ngày hiện tại!',
  })
  startDate: Date;

  @ValidateIf((o) => o.endDate)
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  @MinDate(new Date(new Date().setDate(new Date().getDate() - 1)), {
    message: 'Ngày tháng phải lớn hơn hoặc bằng ngày hiện tại!',
  })
  endDate: Date;

  @IsOptional()
  @IsBoolean()
  isEndDateDisabled: boolean;

  @IsOptional()
  @IsString()
  description: string;

  @ValidateIf((o) => o.isLimit === true)
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  amount: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsBoolean()
  isLimit: boolean;

  @IsOptional()
  @IsNumber()
  minTotalOrder: number;

  @IsOptional()
  @IsNumber()
  maxValue: number;
}

export class UpdateDiscountIssueDto extends PartialType(
  CreateDiscountIssueDto,
) {}

export class findUniqByDiscountCodeDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  branchId: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  code: string
}