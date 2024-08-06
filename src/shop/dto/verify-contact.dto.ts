import { Transform, TransformFnParams } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { IsVietnamesePhoneNumber } from "utils/CustomValidates";

export class VerifyContactDto {
  @ValidateIf((o) => !o.email)
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsVietnamesePhoneNumber()
  @IsString()
  phone: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  shopCode: string;

  @ValidateIf((o) => !o.phone)
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  email: string;

  @IsOptional()
  @IsBoolean()
  isCustomer: string;
}
