import { PartialType } from '@nestjs/swagger'
import { TaxMethod, TaxApplyMode } from '@prisma/client'
import { IsNotEmpty, IsOptional, IsEnum, IsIn, IsBoolean, IsNumber } from 'class-validator'

export class CreateTaxSettingDto {
  @IsNotEmpty()
  @IsEnum(TaxMethod)
  taxMethod: TaxMethod

  @IsNotEmpty()
  @IsEnum(TaxApplyMode)
  taxApplyMode: TaxApplyMode

  @IsOptional()
  @IsIn([0, 1, 2, 3, 5])
  @IsNumber()
  taxDirectRate: number

  @IsOptional()
  @IsBoolean()
  isActive: boolean
}

export class UpdateTaxSettingDto extends PartialType(CreateTaxSettingDto) {}
