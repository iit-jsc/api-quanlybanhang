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
  amount: number;
}

export class CheckAvailableDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  code: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  branchId: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  totalOrder: number;
}
