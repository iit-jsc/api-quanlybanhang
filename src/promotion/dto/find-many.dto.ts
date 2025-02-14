import { Transform, TransformFnParams, Type } from "class-transformer";
import { ArrayMinSize, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { AnyObject } from "interfaces/common.interface";
import { FindManyDto } from "utils/Common.dto";
export class FindManyPromotionDto extends FindManyDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  branchId: string;

  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value);
  })
  isSort?: boolean;

  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Danh sách không được rỗng!' })
  @Type(() => OrderProductDto)
  orderProducts: OrderProductDto[];

  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: number) => +id);
  })
  types?: number[];
}

export class OrderProductDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  productId: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  amount: number;
}