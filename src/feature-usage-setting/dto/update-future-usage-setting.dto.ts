import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf
} from 'class-validator'
import { FEATURE_CODE, FIND_UNIQ_TYPE } from 'enums/common.enum'

export class UpdateFeatureUsageSettingDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  @IsEnum(FEATURE_CODE, { message: 'Chức năng không hợp lệ!' })
  featureCode: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsBoolean()
  isUsed: boolean
}

export class FindUniqFutureUsageSettingDto {
  @IsNumber()
  @Transform(({ value }: TransformFnParams) => {
    return +value
  })
  type: number = FIND_UNIQ_TYPE.ID

  @ValidateIf(o => !o.branchId)
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  shopId: string

  @IsOptional()
  @IsString()
  branchId: string
}
