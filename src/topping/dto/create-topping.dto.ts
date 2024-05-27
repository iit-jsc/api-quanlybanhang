import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateToppingDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => parseInt(id.trim()));
  })
  photoURLs: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách chi nhánh không được rỗng!' })
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  branchIds: number[];
}
