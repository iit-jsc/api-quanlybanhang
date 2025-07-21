import { PartialType } from '@nestjs/swagger'
import { SexType } from '@prisma/client'
import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxDate,
  MaxLength
} from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates'

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @IsNotEmpty()
  isOrganize: boolean

  @IsOptional()
  @IsVietnamesePhoneNumber()
  phone: string

  @IsOptional()
  @IsEmail()
  @IsString()
  @MaxLength(50)
  email: string

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @MaxDate(new Date())
  birthday: Date

  @IsOptional()
  @IsEnum(SexType)
  sex: SexType

  @IsOptional()
  @IsString()
  @MaxLength(100)
  organizeName: string

  @IsOptional()
  @IsString()
  description: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address: string

  @IsOptional()
  @IsString()
  customerTypeId: string

  @IsOptional()
  @IsString()
  @MaxLength(10)
  code: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  tax: string
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class FindManyCustomerDto extends FindManyDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  customerTypeIds: string[]

  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value)
  })
  isOrganize?: boolean
}

export class CheckEmailDto {
  @IsNotEmpty()
  @IsVietnamesePhoneNumber()
  phone: string

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  email: string

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shopId: string
}
