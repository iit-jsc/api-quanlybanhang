import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { FindManyDto } from "utils/Common.dto";

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

export class UpdateEmployeeSalaryDto extends PartialType(CreateEmployeeSalaryDto) { }



export class FindManyEmployeeSalaryDto extends FindManyDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  employeeIds: string[];

  @Transform(({ value }: TransformFnParams) => (value === undefined ? value : Boolean(+value)))
  isFulltime?: boolean;
}