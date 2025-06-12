import { OrderStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, Min } from 'class-validator'

export class CreateQrCodeDto {
  @IsNotEmpty()
  tableId: string

  @IsOptional()
  @Min(1)
  moneyReceived: number

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus

  voucherId?: string
  discountCode?: string
  customerId?: string
  note?: string
  totalPeople?: number
  code?: string
}
