import { PartialType } from '@nestjs/swagger'
import { PaymentMethodType } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsBoolean, IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator'
import { BankNameEnum } from 'enums/bankName.enum'
import { FindManyDto } from 'utils/Common.dto'

export class CreatePaymentMethodDto {
  @IsOptional()
  @IsEnum(BankNameEnum)
  @IsString()
  @MaxLength(50)
  bankName: BankNameEnum

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^(?!\s*$)[a-zA-Z0-9\s]*$/, {
    message: 'bankCode không được chứa ký tự đặc biệt hoặc khoảng trắng'
  })
  bankCode: string

  @IsOptional()
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType

  @IsOptional()
  @IsString()
  @MaxLength(100)
  representative: string

  @IsOptional()
  @IsString()
  photoURL: string

  @IsOptional()
  @IsBoolean()
  active: boolean
}

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) {}

export class FindManyPaymentMethodDto extends FindManyDto {
  @IsOptional()
  @Transform(({ value }) => value?.toString().toLowerCase() === 'true')
  active?: boolean
}
