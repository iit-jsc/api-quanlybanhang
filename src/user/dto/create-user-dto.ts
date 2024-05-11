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
  ValidateNested,
} from 'class-validator';
import { CreateAccountDto } from 'src/account/dto/create-account.dto';
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates';

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
}
