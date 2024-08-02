import { Transform, TransformFnParams } from "class-transformer";
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsBoolean, IsDate } from "class-validator";
import { IsVietnamesePhoneNumber } from "utils/CustomValidates";

export class LoginDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  username: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  password: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shopCode?: string;
}

export class LoginForManagerDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsVietnamesePhoneNumber()
  phone: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  accessToken: string;
}

export class LoginForCustomerDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  code: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsVietnamesePhoneNumber()
  @IsString()
  phone: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  shopId: string;
}

export class LoginForStaffDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  username: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  password: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shopCode: string;
}

export class LogoutDto {
  @IsOptional()
  @IsBoolean()
  isAllDevices: boolean;
}

export class CreateRefreshTokenDto {
  @IsOptional()
  @IsString()
  accountId: string;

  @IsOptional()
  @IsString()
  branchId: string;

  @IsOptional()
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsString()
  ip: string;

  @IsOptional()
  @IsString()
  userAgent: string;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({ message: "Ngày tháng không hợp lệ!" })
  lastLogin: Date;
}
