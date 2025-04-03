import { Type } from 'class-transformer'
import { IsNotEmpty, MinLength, ValidateNested } from 'class-validator'

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
  businessTypeCode: string

  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  code: string

  @IsNotEmpty()
  totalBranches: number

  phone?: string
  email?: string
  address?: string
  photoURL?: string
  domain?: string

  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  @IsNotEmpty()
  user: CreateUserDto
}
