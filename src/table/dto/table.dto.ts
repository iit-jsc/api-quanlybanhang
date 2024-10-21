import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTableDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  seat?: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  areaId: string;
}

export class UpdateTableDto extends PartialType(CreateTableDto) { }
