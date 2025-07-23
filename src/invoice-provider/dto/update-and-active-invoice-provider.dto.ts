import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator'
import { InvoiceProviderType } from '@prisma/client'

export class UpdateAndActiveInvoiceProviderDto {
  @IsNotEmpty()
  @IsString()
  branchId: string

  @IsEnum(InvoiceProviderType)
  @IsNotEmpty()
  providerType: InvoiceProviderType

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsUrl()
  vnptApiUrl: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsUrl()
  vnptLookupUrl: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  vnptUsername: string

  @IsOptional()
  @IsString()
  vnptPassword: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  vnptAccount: string

  @IsOptional()
  @IsString()
  vnptAccountPassword: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  invPattern: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  invSerial: string
}
