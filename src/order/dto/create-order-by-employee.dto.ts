import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PAYMENT_TYPE } from 'enums/common.enum';

export class CreateOrderByEmployeeDto {
  @IsOptional()
  @IsNumber()
  tableId: number;

  @IsOptional()
  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsEnum(PAYMENT_TYPE, { message: 'Hình thức thanh toán không hợp lệ!' })
  @IsNumber()
  paymentMethodId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được rỗng!' })
  @ValidateNested({ each: true })
  @Type(() => Product)
  products: Product[];
}

class Product {
  @IsNotEmpty({ message: 'ID sản phẩm không được để trống!' })
  @IsNumber({}, { message: 'ID sản phẩm phải là số!' })
  productId: number;

  @IsOptional()
  @IsNumber({}, { message: 'ID topping phải là số!' })
  toppingId: number;
}
