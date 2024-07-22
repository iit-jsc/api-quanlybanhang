import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  orderStatus: number;

  @IsOptional()
  @IsNumber()
  paymentMethod: number;

  @IsOptional()
  @IsBoolean()
  isPaid: boolean;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  cancelReason: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cancelDate: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  exchangePoint: number;
}
