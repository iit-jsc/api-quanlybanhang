import { PartialType } from '@nestjs/swagger'
import { IsNotEmpty, MinLength } from 'class-validator'

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
}

export class UpdateShopDto extends PartialType(CreateShopDto) {}
