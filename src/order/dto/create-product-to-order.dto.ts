import { IsNotEmpty, IsNumber } from 'class-validator';

export class createProductToOrderDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  tableId: number;
}
