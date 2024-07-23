import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

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
  promotionId: string;

  @IsOptional()
  @IsString()
  discountCode: string;

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
  isPaid: boolean = false;

  @IsNotEmpty({ message: "Không được để trống!" })
  @ArrayNotEmpty({ message: "Danh sách sản phẩm không được rỗng!" })
  @ValidateNested({ each: true })
  @Type(() => OrderProducts)
  orderProducts: OrderProducts[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  exchangePoint: number;
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
  toppingId: string;

  @IsOptional()
  @IsString()
  note: string;
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsString()
  cancelReason: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cancelDate: Date;
}
