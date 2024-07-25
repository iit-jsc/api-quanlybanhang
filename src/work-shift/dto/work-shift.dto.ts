import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, isNumber, IsNumber, IsOptional, IsString, Matches } from "class-validator";

export class CreateWorkShiftDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  startTime: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsNumber()
  endTime: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limitEmployee?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isNotLimitEmployee?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateWorkShiftDto extends PartialType(CreateWorkShiftDto) {}
