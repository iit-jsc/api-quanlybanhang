import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class FindManyProductTypeDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Type(() => Number)
  @IsNumber()
  branchId: number;

  @Type(() => Number)
  skip?: number;

  @Type(() => Number)
  take?: number;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Type(() => String)
  keyword?: string;
}
