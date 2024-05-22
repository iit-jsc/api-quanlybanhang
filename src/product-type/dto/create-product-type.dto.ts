import { Optional } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDTO {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @Optional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách chi nhánh không được rỗng!' })
  branchIds: number[];
}
