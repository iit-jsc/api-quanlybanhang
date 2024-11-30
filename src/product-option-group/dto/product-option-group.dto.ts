import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class CreateProductOptionGroupDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @ValidateNested({ each: true })
  productOptions: CreateProductOptionDto[];

  @IsOptional()
  isMultiple: boolean;

  @IsOptional()
  isRequired: boolean;
}

export class CreateProductOptionDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @Min(0)
  price: number;

  @IsOptional()
  isDefault: boolean;

  @IsOptional()
  colors: string[];

  @IsOptional()
  photoURL: string;

  @IsOptional()
  id: string;
}

export class UpdateProductOptionGroupDto extends PartialType(CreateProductOptionGroupDto) { }
