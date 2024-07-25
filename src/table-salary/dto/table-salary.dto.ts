import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { ArrayNotEmpty, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTableSalaryDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsBoolean()
  isFulltime: boolean;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  workDay: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @ArrayNotEmpty({ message: "Danh sách nhân viên không được rỗng!" })
  employeeIds: string[];
}

export class UpdateTableSalaryDto extends PartialType(CreateTableSalaryDto) {}
