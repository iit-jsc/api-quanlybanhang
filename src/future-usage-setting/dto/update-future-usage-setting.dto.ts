import { IsBoolean, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { FUTURE_CODE } from "enums/common.enum";

export class UpdateFutureUsageSettingDto {
  @IsNotEmpty({ message: "Không được để trống!" })
  @IsString()
  @IsEnum(FUTURE_CODE, { message: "Chức năng không hợp lệ!" })
  futureCode: string;

  @IsNotEmpty({ message: "Không được để trống!" })
  @IsBoolean()
  isUsed: boolean;
}
