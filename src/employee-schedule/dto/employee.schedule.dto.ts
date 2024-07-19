import { PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsDate, IsNotEmpty, IsString, MinDate } from "class-validator";

export class RegisterScheduleDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  workShiftId: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: "Ngày tháng không hợp lệ!" })
  @MinDate(new Date(new Date().setDate(new Date().getDate() - 1)), {
    message: "Ngày tháng phải lớn hơn hoặc bằng ngày hiện tại!",
  })
  date: Date;
}

export class UpdateRegisterScheduleDto extends PartialType(RegisterScheduleDto) {}
