import { PartialType } from '@nestjs/swagger'
import { VatMethod, VatReductionOption } from '@prisma/client'
import { IsNotEmpty, IsOptional, IsEnum, IsIn, IsBoolean } from 'class-validator'

export class CreateTaxSettingDto {
  @IsEnum(VatMethod)
  @IsNotEmpty()
  vatMethod: VatMethod

  @IsEnum(VatReductionOption)
  @IsNotEmpty()
  vatReductionOption: VatReductionOption

  @IsOptional()
  @IsIn([1, 2, 3, 5])
  vatRateOption: number

  @IsOptional()
  @IsBoolean()
  isActive: boolean
}

export class UpdateTaxSettingDto extends PartialType(CreateTaxSettingDto) {}
