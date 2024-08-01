import { Transform, TransformFnParams } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";
import { PAYMENT_METHOD_TYPE } from "enums/common.enum";

export class UpdatePaymentMethodDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  bankName: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @Matches(/^\d+$/, { message: "Chỉ chấp nhận chuỗi số!" })
  bankCode: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  representative: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  photoURL: string;

  @IsOptional()
  @IsEnum(PAYMENT_METHOD_TYPE, { message: "Loại thanh toán không hợp lệ!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  type: string;

  @IsOptional()
  @IsBoolean()
  active: boolean;
}
