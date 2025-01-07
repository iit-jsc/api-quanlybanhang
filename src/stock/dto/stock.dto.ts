import { IsNotEmpty, IsString } from 'class-validator';
import { FindManyDto } from 'utils/Common.dto';
export class ModifyStockDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  name: string;
}

export class FindManyStockDto extends FindManyDto {
  productId?: string;
}