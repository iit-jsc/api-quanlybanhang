import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max } from 'class-validator';

export class CreateDiscountCodeDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(0, 10, { message: 'Vượt quá kí tự.' })
  @IsString()
  prefix: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(0, 10, { message: 'Vượt quá kí tự.' })
  @IsString()
  suffixes: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  discountIssueId: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @Max(50, { message: 'Số lượng không được vượt quá 50!' })
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
