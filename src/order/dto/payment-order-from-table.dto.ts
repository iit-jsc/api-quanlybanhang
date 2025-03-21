import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator'
import { ORDER_STATUS_COMMON, ORDER_TYPE } from 'enums/order.enum'

export class PaymentFromTableDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  tableId: string

  @IsOptional()
  @IsString()
  customerId: string

  @IsOptional()
  @IsString()
  note: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  paymentMethodId: string

  @IsOptional()
  @IsArray()
  bankingImages: string[]

  @IsOptional()
  @IsString()
  discountCode: string

  @IsOptional()
  @IsString()
  promotionId: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  exchangePoint: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  moneyReceived: number

  @IsNotEmpty({ message: 'Trạng thái đơn hàng không để trống!' })
  @IsNumber()
  @IsEnum(ORDER_STATUS_COMMON, { message: 'Trạng thái không hợp lệ!' })
  orderStatus: number
}
