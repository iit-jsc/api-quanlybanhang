import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';

export class SeparateTableDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  fromTableId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  toTableId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách không được rỗng!' })
  orderDetailIds: number[];
}
