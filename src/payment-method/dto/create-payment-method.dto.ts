import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PAYMENT_STATUS } from 'enums/common.enum';

export class CreatePaymentMethodDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logo: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(PAYMENT_STATUS, { message: 'Trạng thái không hợp lệ!' })
  status?: number;
}
