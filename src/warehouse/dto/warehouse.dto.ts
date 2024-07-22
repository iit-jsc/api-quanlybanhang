import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateWarehouseDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  photoURLs: string[];

  @IsOptional()
  @IsString()
  address: string;

  @IsString()
  @IsNotEmpty({ message: "Không được để trống!" })
  branchId: string;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
