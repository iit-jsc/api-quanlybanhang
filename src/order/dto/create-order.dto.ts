import { Transform, TransformFnParams } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PAYMENT_TYPE } from 'enums/common.enum';
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates';

export class CreateOrderByEmployeeDto {
  @IsOptional()
  @IsNumber()
  tableId: number;

  @IsOptional()
  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsVietnamesePhoneNumber()
  phone: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsEnum(PAYMENT_TYPE, { message: 'Hình thức thanh toán không hợp lệ!' })
  @IsNumber()
  paymentMethodId: number;

  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng.',
    },
  )
  email: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được rỗng!' })
  productIds: number[];
}
