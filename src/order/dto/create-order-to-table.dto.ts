import { Transform, TransformFnParams, Type } from 'class-transformer';
import { ProductInOrder } from './create-order.dto';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateOrderToTableDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  tableId: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được rỗng!' })
  @ValidateNested({ each: true })
  @Type(() => ProductInOrder)
  products: ProductInOrder[];
}
