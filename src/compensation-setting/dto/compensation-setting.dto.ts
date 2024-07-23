import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCompensationSettingDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  type: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  defaultValue: number;
}

export class UpdateCompensationSettingDto extends PartialType(CreateCompensationSettingDto) {}
