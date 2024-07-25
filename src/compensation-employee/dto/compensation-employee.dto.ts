import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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
