import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class SeparateTableDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  fromTableId: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  toTableId: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách không được rỗng!' })
  orderDetailIds: string[];
}
