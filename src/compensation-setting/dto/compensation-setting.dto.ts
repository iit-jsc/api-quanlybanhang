import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { COMPENSATION_APPLY_TO, COMPENSATION_TYPE } from "enums/common.enum";

export class CreateCompensationSettingDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  @IsEnum(COMPENSATION_TYPE, { message: "Loại không hợp lệ!" })
  type: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  @IsEnum(COMPENSATION_APPLY_TO, { message: "Loại nhân viên áp dụng không hợp lệ!" })
  applyTo: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  defaultValue: number;
}

export class UpdateCompensationSettingDto extends PartialType(CreateCompensationSettingDto) {}
