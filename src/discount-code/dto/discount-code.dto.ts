import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDiscountCodeDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  prefix: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  suffixes: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  discountIssueId: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  quantityUsed: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  amount: number;
}
