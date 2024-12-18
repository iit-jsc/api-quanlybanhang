import { Transform, TransformFnParams, Type } from "class-transformer";
import { ArrayMinSize, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { AnyObject } from "interfaces/common.interface";
export class FindManyPromotionDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  branchId: string;

  @Type(() => Number)
  skip?: number;

  @Type(() => Number)
  take?: number;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Type(() => String)
  keyword?: string;

  @Transform(({ value }: TransformFnParams) => {
    return Boolean(+value);
  })
  isSort?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value) {
      const [field, direction] = value.split(",");
      if (field && direction) {
        return { [field]: direction };
      }
    }
    return { createdAt: "desc" };
  })
  orderBy?: AnyObject;

  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Danh sách không được rỗng!' })
  @Type(() => OrderProductDto)
  orderProducts: OrderProductDto[];
}

export class OrderProductDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  productId: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  amount: number;
}