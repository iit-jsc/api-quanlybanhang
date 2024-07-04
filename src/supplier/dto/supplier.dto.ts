import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates';

export class CreateSupplierDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsVietnamesePhoneNumber()
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  representativeName: string;

  @IsOptional()
  @IsVietnamesePhoneNumber()
  representativePhone: string;

  @IsOptional()
  @IsString()
  supplierTypeId: string;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
