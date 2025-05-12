import { PartialType } from '@nestjs/swagger'
import { PaymentMethodType } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreatePaymentMethodDto {
  bankName?: string
  bankCode?: string

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
  @Transform(({ value }) => value?.toString().toLowerCase() === 'true')
  active?: boolean
}
