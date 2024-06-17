import { Prisma } from '@prisma/client';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates';

class CreateAccountDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự.' })
  password: string;
}

export class CreateUserDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsVietnamesePhoneNumber()
  phone: string;

  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng.',
    },
  )
  email?: string;

  @IsNotEmpty({ message: 'Phải cung cấp thông tin người dùng!' })
  @ValidateNested()
  @Type(() => CreateAccountDto)
  account: CreateAccountDto;

  @IsOptional()
  @IsNumber()
  type?: number;
}
