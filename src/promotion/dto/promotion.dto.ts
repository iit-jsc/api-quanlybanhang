import { PartialType } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinDate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DISCOUNT_TYPE, PROMOTION_TYPE } from 'enums/common.enum';

export class CreatePromotionDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @IsOptional()
  @IsString()
  code: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  @MinDate(new Date(new Date().setDate(new Date().getDate() - 1)), {
    message: 'Ngày tháng phải lớn hơn hoặc bằng ngày hiện tại!',
  })
  startDate: Date;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  @MinDate(new Date(new Date().setDate(new Date().getDate() - 1)), {
    message: 'Ngày tháng phải lớn hơn hoặc bằng ngày hiện tại!',
  })
  endDate: Date;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsBoolean()
  isEndDateDisabled: boolean;

  @IsOptional()
  @IsBoolean()
  isLimit: boolean;

  @IsOptional()
  @IsNumber()
  amountCustomer: number;

  @IsOptional()
  @IsBoolean()
  isLimitCustomer: boolean;

  @IsOptional()
  @IsString()
  description: string;

  @ValidateIf((o) => o.type === PROMOTION_TYPE.VALUE)
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  value: number;

  @ValidateIf((o) => o.type === PROMOTION_TYPE.VALUE)
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @IsEnum(DISCOUNT_TYPE, { message: 'Giá trị không hợp lệ!' })
  typeValue: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @IsEnum(PROMOTION_TYPE, { message: 'Giá trị không hợp lệ!' })
  type: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PromotionConditionDto)
  promotionConditions: PromotionConditionDto[];

  @ValidateIf((o) => o.type === PROMOTION_TYPE.GIFT)
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PromotionProductDto)
  promotionProducts: PromotionProductDto[];
}

class PromotionConditionDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  productId: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  amount: number;
}

class PromotionProductDto {
  @IsOptional()
  @IsString()
  productId: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  photoURL: string;
}

export class ProductsOrderDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PromotionProductDto)
  @ArrayMinSize(1, { message: 'Danh sách không được rỗng!' })
  productsOrder: ProductAmountDto[];
}

export class ProductAmountDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  productId: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  amount: number;
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}
