import { IsNotEmpty, IsNumber } from 'class-validator';

export class CombineTableDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  fromTableId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  toTableId: number;
}
