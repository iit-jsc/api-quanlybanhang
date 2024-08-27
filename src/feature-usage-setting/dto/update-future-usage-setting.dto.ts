import { IsBoolean, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { FEATURE_CODE } from "enums/common.enum";

export class UpdateFeatureUsageSettingDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  @IsEnum(FEATURE_CODE, { message: "Chức năng không hợp lệ!" })
  featureCode: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsBoolean()
  isUsed: boolean;
}
