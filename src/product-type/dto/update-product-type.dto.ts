import { Optional } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateProductTypeDTO {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách chi nhánh không được rỗng!' })
  branchIds: number[];
}
