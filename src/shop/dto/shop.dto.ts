import { PartialType } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator'
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates'

export class CreateUserDto {
  @IsNotEmpty()
  phone: string

  email?: string

  @IsNotEmpty()
  @MinLength(6)
  password: string
}

export class CreateShopDto {
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsVietnamesePhoneNumber()
  phone?: string

  @IsOptional()
  @IsEmail()
  email?: string

  address?: string
}

export class UpdateShopDto extends PartialType(CreateShopDto) {}
