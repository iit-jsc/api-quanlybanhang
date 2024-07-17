import { Transform, TransformFnParams } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsVietnamesePhoneNumber } from "utils/CustomValidates";

export class VerifyPhoneDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsVietnamesePhoneNumber()
  @IsString()
  phone: string;

  @IsOptional()
  @IsBoolean()
  isCustomer: string;
}
