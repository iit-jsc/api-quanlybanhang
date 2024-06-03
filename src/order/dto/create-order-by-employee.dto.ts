import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PRICE_TYPE } from 'enums/product.enum';

export class CreateOrderByEmployeeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Không được là chuỗi rỗng!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  code: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsBoolean()
  isTable: number;

  @IsOptional()
  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsNumber()
  tableId: number;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsNumber()
  orderStatus: number;

  @IsOptional()
  @IsNumber()
  paymentMethod: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được rỗng!' })
  @ValidateNested({ each: true })
  @Type(() => Product)
  products: Product[];
}

class Product {
  @IsNotEmpty({ message: 'ID sản phẩm không được để trống!' })
  @IsNumber({}, { message: 'ID sản phẩm phải là số!' })
  id: number;

  @IsNotEmpty({ message: 'Số lượng sản phẩm không được để trống!' })
  @IsNumber({}, { message: 'Số lượng sản phẩm phải là số!' })
  amount: number;

  @IsNotEmpty({ message: 'Loại giá không được để trống!' })
  @IsNumber({}, { message: 'Loại giá phải là số!' })
  @IsEnum(PRICE_TYPE, { message: 'Loại giá không hợp lệ!' })
  priceType: number;

  @IsOptional()
  @IsNumber({}, { message: 'ID topping phải là số!' })
  toppingId: number;

  @IsOptional()
  @IsString()
  note: string;
}
