import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  unitId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  productTypeId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Không được là chuỗi rỗng!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  code: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsArray()
  photoURLs: string[];

  @IsOptional()
  @IsObject()
  otherAttributes: object;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value);
  })
  isCombo: boolean;

  @IsOptional()
  status: number;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value);
  })
  isInitialStock: boolean;
}
