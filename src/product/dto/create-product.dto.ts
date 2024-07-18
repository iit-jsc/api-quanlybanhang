import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  price: number;

  @IsOptional()
  @IsArray()
  photoURLs: string[];

  @IsOptional()
  @IsObject()
  otherAttributes: object;

  @IsOptional()
  status: number;
}
