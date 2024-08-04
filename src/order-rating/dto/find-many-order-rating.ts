import { Transform, Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";
import { AnyObject } from "interfaces/common.interface";

export class FindManyOrderRatings {
  @Type(() => Number)
  skip?: number;

  @Type(() => Number)
  take?: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  orderId: string;

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
}
