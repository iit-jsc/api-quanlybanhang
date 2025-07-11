import { PartialType } from '@nestjs/swagger'
import { DiscountFor, DiscountType, SexType } from '@prisma/client'
import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxDate,
  Validate,
  ValidateIf
} from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'
import { DiscountConstraint, IsVietnamesePhoneNumber } from 'utils/CustomValidates'

export class CreateCustomerDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  isOrganize: boolean

  @IsNotEmpty()
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
  @IsEnum(DiscountFor)
  discountFor: DiscountFor

  @ValidateIf(o => o.discountFor === DiscountFor.CUSTOMER)
  @IsNotEmpty()
  @Validate(DiscountConstraint)
  discount: number

  @ValidateIf(o => o.discountFor === DiscountFor.CUSTOMER)
  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType

  @IsOptional()
  @IsEnum(SexType)
  sex: SexType

  fax?: string
  tax?: string
  representativeName?: string
  representativePhone?: string
  customerTypeId?: string
  address?: string
  description?: string
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class FindManyCustomerDto extends FindManyDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(',').map((id: string) => id.trim())
  })
  customerTypeIds: string[]
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
