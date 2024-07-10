import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates';

export class ModifyStockDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  name: string;
}
