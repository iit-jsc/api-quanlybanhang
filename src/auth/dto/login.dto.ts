import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsEmail
} from 'class-validator'
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates'

export class LoginForManagerDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsVietnamesePhoneNumber()
  phone: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  password: string

  @IsOptional()
  @IsString()
  accessToken: string
}

export class LoginForCustomerDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  otp: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  email: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  shopId: string
}

export class LoginDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  username: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  password: string
}

export class CreateRefreshTokenDto {
  @IsOptional()
  @IsString()
  accountId: string

  @IsOptional()
  @IsString()
  branchId: string

  @IsOptional()
  @IsString()
  deviceId: string

  @IsOptional()
  @IsString()
  ip: string

  @IsOptional()
  @IsString()
  userAgent: string

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: 'Ngày tháng không hợp lệ!' })
  lastLogin: Date
}
