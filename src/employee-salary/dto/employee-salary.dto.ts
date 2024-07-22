import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEmployeeSalaryDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  baseSalary: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsBoolean()
  isFulltime: boolean;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  salaryType: number;
}

export class UpdateEmployeeSalaryDto extends PartialType(CreateEmployeeSalaryDto) {}
