import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { InvoiceProviderType } from '@prisma/client'

export class UpdateAndActiveInvoiceProviderDto {
  @IsEnum(InvoiceProviderType)
  @IsNotEmpty()
  providerType: InvoiceProviderType

  @IsOptional()
  @IsString()
  vnptApiUrl?: string

  @IsOptional()
  @IsString()
  vnptUsername?: string

  @IsOptional()
  @IsString()
  vnptPassword?: string

  @IsOptional()
  @IsString()
  vnptAccount?: string

  @IsOptional()
  @IsString()
  vnptAccountPassword?: string

  @IsOptional()
  @IsString()
  invPattern?: string

  @IsOptional()
  @IsString()
  invSerial?: string
}
