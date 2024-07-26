import { Transform, TransformFnParams, Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateQRSettingDto {
  @IsOptional()
  @IsBoolean()
  isShowLogo: boolean;

  @IsOptional()
  @IsBoolean()
  isShowWifi: boolean;

  @IsOptional()
  @IsBoolean()
  isShowTable: boolean;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  isShowBranchName: boolean;

  @IsOptional()
  @IsBoolean()
  isShowShopName: boolean;
}
