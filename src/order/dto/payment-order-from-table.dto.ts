import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class PaymentFromTableDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  tableId: string;

  @IsOptional()
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsNumber()
  paymentMethod: number;

  @IsOptional()
  @IsString()
  discountCode: string;

  @IsOptional()
  @IsString()
  promotionId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  exchangePoint: number;
}
