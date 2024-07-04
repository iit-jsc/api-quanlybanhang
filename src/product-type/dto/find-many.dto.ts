import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindManyProductTypeDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Type(() => Number)
  @IsString()
  branchId: string;

  @Type(() => Number)
  skip?: number;

  @Type(() => Number)
  take?: number;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Type(() => String)
  keyword?: string;
}
