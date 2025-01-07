import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { FindManyDto } from "utils/Common.dto";

export class UpdateCompensationEmployeeDto {
  @IsOptional()
  @IsNumber()
  value: number;
}

export class CreateCompensationEmployeeDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  employeeId: string;
}


export class FindManyCompensationEmployeeDto extends FindManyDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.split(",").map((id: string) => id.trim());
  })
  employeeIds: string[];
}