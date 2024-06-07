import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentFromTableDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  tableId: number;

  @IsOptional()
  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsNumber()
  paymentMethod: number;
}
