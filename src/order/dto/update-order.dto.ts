import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  orderStatus: number;

  @IsOptional()
  @IsNumber()
  paymentMethod: number;

  @IsOptional()
  @IsBoolean()
  isPaid: boolean;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  cancelReason: string;

  @IsOptional()
  @IsDate()
  cancelDate: Date;
}
