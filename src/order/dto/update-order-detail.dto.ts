import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { DETAIL_ORDER_STATUS } from "enums/order.enum";

export class UpdateOrderProductDto {
  @IsOptional()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsNumber()
  @IsEnum(DETAIL_ORDER_STATUS, { message: "Trạng thái không hợp lệ!" })
  status: number;

  @IsOptional()
  productOptionIds: string[];
}
