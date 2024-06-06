import { Type } from 'class-transformer';
import { ProductInOrder } from './create-order.dto';
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
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates';

export class CreateOrderOnlineDto {
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
