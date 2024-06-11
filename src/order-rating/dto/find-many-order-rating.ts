import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class FindManyOrderRatings {
  @Type(() => Number)
  skip?: number;

  @Type(() => Number)
  take?: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Type(() => Number)
  orderId: number;
}
