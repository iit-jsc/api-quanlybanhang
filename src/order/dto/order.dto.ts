import { PartialType } from "@nestjs/swagger";
import { Product } from "@prisma/client";
import { Transform, TransformFnParams, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { ORDER_STATUS_COMMON } from "enums/order.enum";

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Không được là chuỗi rỗng!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  code: string;

  @IsOptional()
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsNumber()
  @IsEnum(ORDER_STATUS_COMMON, { message: "Trạng thái không hợp lệ!" })
  orderStatus: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @ArrayNotEmpty({ message: "Danh sách sản phẩm không được rỗng!" })
  @ValidateNested({ each: true })
  @Type(() => OrderProducts)
  orderProducts: OrderProducts[];
}

export class OrderProducts {
  @IsNotEmpty({ message: "ID sản phẩm không được để trống!" })
  @IsString()
  productId: string;

  @IsNotEmpty({ message: "Số lượng sản phẩm không được để trống!" })
  @IsNumber({}, { message: "Số lượng sản phẩm phải là số!" })
  amount: number;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  productOptionIds: string[];
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsString()
  cancelReason: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cancelDate: Date;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  paymentMethodId: string;

  @IsOptional()
  @IsArray()
  bankingImages: string[];
}

export class PaymentOrderDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  exchangePoint: number;

  @IsOptional()
  @IsString()
  promotionId: string;

  @IsOptional()
  @IsString()
  discountCode: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  paymentMethodId: string;

  @IsOptional()
  @IsArray()
  bankingImages: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  moneyReceived: number;

  @IsOptional()
  @IsString()
  customerId: string;
}
