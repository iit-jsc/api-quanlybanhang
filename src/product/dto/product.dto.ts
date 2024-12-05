import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from "class-validator";
import { PRODUCT_STATUS } from "enums/product.enum";

export class CreateProductDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  unitId: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  productTypeId: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "Không được là chuỗi rỗng!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  code: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice: number;

  @IsOptional()
  @IsArray()
  photoURLs: string[];

  @IsOptional()
  @IsObject()
  otherAttributes: object;

  @IsOptional()
  @IsEnum(PRODUCT_STATUS, { message: "Trạng thái không hợp lệ!" })
  status: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) { }
