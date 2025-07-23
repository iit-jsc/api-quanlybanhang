import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
  ValidateNested,
  Min
} from 'class-validator'
import { Type } from 'class-transformer'
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates'

export class CreateInvoiceDetailDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  productName: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  productCode: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit: string

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  vatRate: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  vatAmount: number
}

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  orderId: string

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalBeforeTax: number

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalTax: number

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  customerName: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @IsVietnamesePhoneNumber()
  customerPhone: string

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
  @MaxLength(255)
  customerAddress: string

  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  customerEmail: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalTaxDiscount: number

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAfterTax: number

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceDetailDto)
  invoiceDetails: CreateInvoiceDetailDto[]
}

export class ExportInvoicesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceDto)
  invoices: CreateInvoiceDto[]

  @IsNotEmpty()
  @IsBoolean()
  exportElectronic: boolean
}
