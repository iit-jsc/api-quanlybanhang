import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PaymentFromTableDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  tableId: number;

  @IsOptional()
  @IsNumber()
  customerId: number;
}
