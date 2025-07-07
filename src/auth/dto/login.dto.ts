import { Transform, TransformFnParams } from 'class-transformer'
import { IsString, IsNotEmpty, IsOptional, IsDate, IsEmail } from 'class-validator'
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates'

export class LoginForManagerDto {
  @IsNotEmpty()
  @IsVietnamesePhoneNumber()
  phone: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsOptional()
  @IsString()
  accessToken: string
}

export class LoginForCustomerDto {
  @IsNotEmpty()
  @IsString()
  otp: string

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  shopId: string
}

export class LoginDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  username: string

  @IsNotEmpty()
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
