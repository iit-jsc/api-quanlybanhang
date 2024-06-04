import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PAYMENT_METHOD } from 'enums/common.enum';
import { PRICE_TYPE } from 'enums/product.enum';
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates';

export class CreateOrderByCustomerWithTableDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  branchId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  tableId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được rỗng!' })
  @ValidateNested({ each: true })
  @Type(() => ProductInOrder)
  products: ProductInOrder[];
}

export class CreateOrderByCustomerOnlineDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  branchId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsVietnamesePhoneNumber()
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsNumber()
  @IsEnum(PAYMENT_METHOD, { message: 'Phương thức thanh toán không hợp lệ!' })
  paymentMethod: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được rỗng!' })
  @ValidateNested({ each: true })
  @Type(() => ProductInOrder)
  products: ProductInOrder[];
}

export class ProductInOrder {
  @IsNotEmpty({ message: 'ID sản phẩm không được để trống!' })
  @IsNumber({}, { message: 'ID sản phẩm phải là số!' })
  id: number;

  @IsNotEmpty({ message: 'Số lượng sản phẩm không được để trống!' })
  @IsNumber({}, { message: 'Số lượng sản phẩm phải là số!' })
  amount: number;

  @IsOptional()
  @IsNumber({}, { message: 'ID topping phải là số!' })
  toppingId: number;

  @IsOptional()
  @IsString()
  note: string;
}
