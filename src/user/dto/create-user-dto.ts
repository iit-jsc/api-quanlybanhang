import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { IsVietnamesePhoneNumber } from "utils/CustomValidates";

export class CreateUserDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsVietnamesePhoneNumber()
  phone: string;

  @IsEmail(
    {},
    {
      message: "Email không đúng định dạng.",
    },
  )
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsNumber()
  type?: number;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  password: string;
}
