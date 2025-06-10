import { IsNotEmpty } from 'class-validator'
import { PaymentDto } from 'src/order/dto/payment.dto'

export class CreateQrCodeDto extends PaymentDto {
  @IsNotEmpty()
  tableId: string

  totalPeople?: number

  code?: string
}
