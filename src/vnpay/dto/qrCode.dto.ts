import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator'

export class CreateQrCodeDto {
  @ValidateIf(o => !o.orderId)
  @IsNotEmpty({
    message: 'tableId is required when orderId is not available'
  })
  tableId?: string

  @ValidateIf(o => !o.tableId)
  @IsNotEmpty({ message: 'orderId is required when tableId is not available' })
  orderId?: string

  @IsOptional()
  @IsString()
  customerId: string

  @IsOptional()
  @IsString()
  note: string

  @IsOptional()
  @IsString()
  code: string

  @IsOptional()
  @IsNumber()
  discountValue: number
}
