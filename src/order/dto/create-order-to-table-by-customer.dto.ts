import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { ProductInOrder } from './create-order.dto';

export class CreateOrderToTableByCustomerDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  tableId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  branchId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được rỗng!' })
  @ValidateNested({ each: true })
  @Type(() => ProductInOrder)
  products: ProductInOrder[];
}
