import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateSupplierTypeDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}

export class UpdateSupplierTypeDto extends PartialType(CreateSupplierTypeDto) {}
