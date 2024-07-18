import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";

export class CreateWorkShiftDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Thời gian không hợp lệ, định dạng phải là HH:mm" })
  startTime: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Thời gian không hợp lệ, định dạng phải là HH:mm" })
  endTime: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limitEmployee?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isNotLimitEmployee?: boolean;
}

export class UpdateWorkShiftDto extends PartialType(CreateWorkShiftDto) {}
