import { IsNotEmpty, IsNumber } from 'class-validator';

export class approveOrderDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  tableId: number;
}
