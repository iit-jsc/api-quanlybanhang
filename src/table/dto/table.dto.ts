import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { FindManyDto } from "utils/Common.dto";

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

export class FindManyTableDto extends FindManyDto {
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  areaIds: string[];
}

export class UpdateTableDto extends PartialType(CreateTableDto) { }

