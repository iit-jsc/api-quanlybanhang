import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { ArrayNotEmpty, IsBoolean, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class CreateProductOptionGroupDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @ValidateNested({ each: true })
  productOptions: CreateProductOptionDto[];

  @IsNotEmpty({ message: "Không được để trống!" })
  @ArrayNotEmpty({ message: "Không được để mảng rỗng!" })
  productTypeIds: string[];

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
  photoURL: string;
}

export class UpdateProductOptionGroupDto extends PartialType(CreateProductOptionGroupDto) {}
