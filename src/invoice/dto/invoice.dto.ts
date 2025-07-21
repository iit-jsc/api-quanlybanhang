import { IsNotEmpty, IsOptional, IsString, IsEmail, MaxLength, IsBoolean } from 'class-validator'

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsBoolean()
  isExported: boolean

  @IsNotEmpty()
  @IsString()
  orderId: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  customerName: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalName: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  customerTaxCode: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  customerCardId: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  passport: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerAddress: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerPhone: string

  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  customerEmail: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerBankName: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  customerBankCode: string
}
