import { PartialType } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

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
}

export class UpdateEmployeeSalaryDto extends PartialType(CreateEmployeeSalaryDto) {}
