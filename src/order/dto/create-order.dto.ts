import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Không được là chuỗi rỗng!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  code: string;

  @IsOptional()
  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsNumber()
  orderStatus: number;

  @IsOptional()
  @IsNumber()
  paymentMethod: number;

  @IsOptional()
  @IsBoolean()
  isPaid: Boolean = false;

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
