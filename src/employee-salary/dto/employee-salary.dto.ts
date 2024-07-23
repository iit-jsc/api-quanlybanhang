import { PartialType } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { SALARY_TYPE } from "enums/common.enum";

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
  @IsEnum(SALARY_TYPE, { message: "Loại lương không hợp lệ!" })
  salaryType: number;
}

export class UpdateEmployeeSalaryDto extends PartialType(CreateEmployeeSalaryDto) {}
