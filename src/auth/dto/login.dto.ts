import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates';

export class LoginDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  password: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shopCode?: string;
}

export class LoginWithCustomerDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  code: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsVietnamesePhoneNumber()
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  shopId: number;
}