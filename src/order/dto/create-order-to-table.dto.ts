import { Transform, TransformFnParams, Type } from "class-transformer";
import { OrderProducts } from "./order.dto";
import { ArrayNotEmpty, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class CreateOrderToTableDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  tableId: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @ArrayNotEmpty({ message: "Danh sách sản phẩm không được rỗng!" })
  @ValidateNested({ each: true })
  @Type(() => OrderProducts)
  orderProducts: OrderProducts[];
}
