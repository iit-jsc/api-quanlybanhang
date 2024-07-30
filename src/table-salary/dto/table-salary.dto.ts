import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";

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

  @ValidateIf((o) => o.isFulltime == true)
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  workDay: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @ArrayNotEmpty({ message: "Danh sách nhân viên không được rỗng!" })
  employeeIds: string[];

  @ValidateIf((o) => o.isFulltime == false)
  @IsNotEmpty({ message: "Không được để trống!" })
  @Type(() => Date)
  @IsDate()
  from: Date;

  @ValidateIf((o) => o.isFulltime == false)
  @IsNotEmpty({ message: "Không được để trống!" })
  @Type(() => Date)
  @IsDate()
  to: Date;
}

export class UpdateTableSalaryDto extends PartialType(CreateTableSalaryDto) {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DetailTableSalaryDto)
  detailTableSalaries: DetailTableSalaryDto[];
}

export class AllowanceValueDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  id: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  value: number;
}

export class DeductionValueDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  id: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  value: number;
}

export class DetailTableSalaryDto {
  @ArrayNotEmpty({ message: "Danh sách trợ cấp không được rỗng!" })
  @ValidateNested({ each: true })
  @Type(() => AllowanceValueDto)
  allowanceValue: AllowanceValueDto[];

  @ArrayNotEmpty({ message: "Danh sách khấu trừ không được rỗng!" })
  @ValidateNested({ each: true })
  @Type(() => DeductionValueDto)
  deductionValue: DeductionValueDto[];

  @IsOptional()
  @IsNumber()
  totalHours: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  baseSalary: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  workDay: number;
}
