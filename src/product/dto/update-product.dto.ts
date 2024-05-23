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

export class UpdateProductDTO {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách chi nhánh không được rỗng!' })
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  branchIds: number[];

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @Type(() => Number)
  unitId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @Type(() => Number)
  productTypeId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Không được là chuỗi rỗng!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  code: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  retailPrice: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wholesalePrice: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  importPrice: number;

  @IsOptional()
  @IsArray()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => parseInt(id.trim()));
  })
  photoURLs: string[];

  @IsOptional()
  @IsObject()
  @Transform(({ value }: TransformFnParams) => {
    return JSON.parse(value);
  })
  @Type(() => Object)
  otherAttributes: object;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isCombo: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Number)
  status: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isInitialStock: boolean;
}
