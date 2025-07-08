import { PartialType } from '@nestjs/swagger'
import { AccountStatus, SexType } from '@prisma/client'
import { Transform, TransformFnParams, Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxDate,
  MinLength
} from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates'

export class CreateUserDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string

  @IsNotEmpty()
  @IsVietnamesePhoneNumber()
  phone: string

  @IsNotEmpty()
  employeeGroupId: string

  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  roleIds: string[]

  @IsNotEmpty()
  @ArrayNotEmpty()
  branchIds: string[]

  @IsOptional()
  @IsEmail()
  email: string

  @IsOptional()
  @IsEnum(SexType)
  sex: SexType

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MaxDate(new Date())
  birthday: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MaxDate(new Date())
  cardDate: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate: Date

  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsOptional()
  @IsEnum(AccountStatus)
  status: AccountStatus

  photoURL?: string
  address?: string
  code?: string
  cardId?: string
  cardAddress?: string
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @MinLength(6)
  newPassword: string
}

export class ChangePassword {
  @IsOptional()
  @MinLength(6)
  newPassword: string
}

export class ChangeMyPassword {
  @IsOptional()
  @MinLength(6)
  newPassword: string

  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus: AccountStatus
}

export class CheckUniqUserDto {
  @IsNotEmpty()
  @IsEnum(['phone', 'email', 'code'])
  field: string

  @IsNotEmpty()
  value: string

  @IsOptional()
  id: string
}

export class FindManyUserDto extends FindManyDto {
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',')
  })
  employeeGroupIds?: string[]
}
