import { OrderStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator'

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
  @IsEnum(OrderStatus)
  status: OrderStatus

  customerId?: string
  note?: string
  code?: string
}
