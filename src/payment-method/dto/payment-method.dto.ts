import { PartialType } from '@nestjs/swagger'
import { PaymentMethodType } from '@prisma/client'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsEnum, IsOptional, Matches } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreatePaymentMethodDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  bankName: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Matches(/^\d+$/)
  bankCode: string

  @IsOptional()
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType

  representative?: string
  photoURL?: string
  active?: boolean
}

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) {}

export class FindManyPaymentMethodDto extends FindManyDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value)
  })
  active?: boolean
}
