import { Transform, TransformFnParams } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsVietnamesePhoneNumber } from "utils/CustomValidates";

export class ConfirmEmailDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  otp: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail()
  @IsString()
  email: string;
}
