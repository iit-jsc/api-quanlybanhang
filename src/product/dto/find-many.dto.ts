import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class FindManyProductDto {
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

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  measurementUnitIds: number[];

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  productTypeIds: number[];

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  statuses?: number[];

  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value);
  })
  isCombo?: boolean;
}
