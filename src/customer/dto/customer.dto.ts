import { PartialType } from '@nestjs/swagger'
import { SexType } from '@prisma/client'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MaxDate } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates'

export class CreateCustomerDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  isOrganize: boolean

  @IsOptional()
  @IsVietnamesePhoneNumber()
  phone: string

  @IsOptional()
  @IsEmail()
  email: string

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @MaxDate(new Date())
  birthday: Date

  @IsOptional()
  @IsEnum(SexType)
  sex: SexType

  organizeName?: string
  description?: string
  address?: string
  customerTypeId?: string
  code?: string
  tax?: string
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
