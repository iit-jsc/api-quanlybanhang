import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTableSalaryDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;
}

export class UpdateTableSalaryDto extends PartialType(CreateTableSalaryDto) {}
