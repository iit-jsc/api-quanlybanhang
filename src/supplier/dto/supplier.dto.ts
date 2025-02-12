import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { IsVietnamesePhoneNumber } from "utils/CustomValidates";
import { FindManyDto } from "utils/Common.dto";
import { Transform, TransformFnParams } from "class-transformer";

export class CreateSupplierDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Không được để trống!" })
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

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  supplierTypeId: string;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}


export class FindManySupplierDto extends FindManyDto {
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",");
  })
  supplierTypeIds?: string[];
}