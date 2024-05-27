import { Optional } from '@nestjs/common';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxDate,
  MinLength,
} from 'class-validator';
import { ACCOUNT_STATUS, SEX_TYPE } from 'enums/user.enum';
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates';

export class CreateEmployeeDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsVietnamesePhoneNumber()
  phone: string;

  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng.',
    },
  )
  email: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(SEX_TYPE, { message: 'Giới tính không hợp lệ!' })
  sex: number;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  @MaxDate(new Date(), { message: 'Ngày tháng phải nhỏ hơn ngày hiện tại!' })
  birthday: Date;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  @MaxDate(new Date(), { message: 'Ngày tháng phải nhỏ hơn ngày hiện tại!' })
  cardDate: Date;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  @MaxDate(new Date(), { message: 'Ngày tháng phải nhỏ hơn ngày hiện tại!' })
  startDate: Date;

  @IsOptional()
  type: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  employeeGroupId: number;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value
      ?.split(',')
      .map((id: string) => parseInt(id.trim()))
      .filter((id: number) => !isNaN(id));
  })
  permissionIds: number[];

  @IsOptional()
  photoURL: string;

  @IsOptional()
  address: string;

  @IsOptional()
  cardId: string;

  @IsOptional()
  cardAddress: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Không được là chuỗi rỗng!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  code: string;
}
