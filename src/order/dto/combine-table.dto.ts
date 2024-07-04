import { IsNotEmpty, IsNumber } from 'class-validator';

export class CombineTableDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  fromTableId: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  toTableId: string;
}
