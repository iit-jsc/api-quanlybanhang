import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsString,
  ValidateNested
} from 'class-validator'
import { OrderProducts } from './order.dto'

export class CreateOrderToTableByCustomerDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  tableId: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  branchId: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được rỗng!' })
  @ValidateNested({ each: true })
  @Type(() => OrderProducts)
  orderProducts: OrderProducts[]
}
