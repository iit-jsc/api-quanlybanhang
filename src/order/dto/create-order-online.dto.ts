import { Type } from "class-transformer";
import { OrderProducts } from "./order.dto";
import {
  ArrayNotEmpty,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { PAYMENT_METHOD_TYPE } from "enums/common.enum";
import { IsVietnamesePhoneNumber } from "utils/CustomValidates";

export class CreateOrderOnlineDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  branchId: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsVietnamesePhoneNumber()
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @ArrayNotEmpty({ message: "Danh sách sản phẩm không được rỗng!" })
  @ValidateNested({ each: true })
  @Type(() => OrderProducts)
  orderProducts: OrderProducts[];

  @IsOptional()
  @IsString()
  discountCode: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  exchangePoint: number;
}
