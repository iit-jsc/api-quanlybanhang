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
  ValidateNested,
} from 'class-validator';
import { PROMOTION_TYPE } from 'enums/product.enum';

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
  @MinDate(new Date(), { message: 'Ngày tháng phải lớn hơn ngày hiện tại!' })
  startDate: Date;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  @MinDate(new Date(), { message: 'Ngày tháng phải lớn hơn ngày hiện tại!' })
  endDate: Date;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsBoolean()
  isHasEndDate: boolean;

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

  @IsOptional()
  @IsNumber()
  value: number;

  @IsOptional()
  @IsNumber()
  typeValue: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @IsEnum(PROMOTION_TYPE, { message: 'Giới tính không hợp lệ!' })
  type: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ValidateNested({ each: true })
  @Type(() => PromotionConditionDto)
  @ArrayMinSize(1, { message: 'Danh sách không được rỗng!' })
  promotionConditions: PromotionConditionDto[];

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ValidateNested({ each: true })
  @Type(() => PromotionProductDto)
  @ArrayMinSize(1, { message: 'Danh sách không được rỗng!' })
  promotionProducts: PromotionProductDto[];
}

class PromotionConditionDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  productId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  amount: number;
}

class PromotionProductDto {
  @IsOptional()
  @IsNumber()
  productId: number;

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
  @IsNumber()
  productId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  amount: number;
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}
