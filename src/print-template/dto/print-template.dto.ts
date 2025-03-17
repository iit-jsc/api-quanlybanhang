import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'
import { PRINT_TEMPLATE_TYPE } from 'enums/common.enum'

export class UpdatePrintTemplateDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  @IsEnum(PRINT_TEMPLATE_TYPE, { message: 'Kiểu mẫu in không hợp lệ!' })
  type: number

  @IsOptional()
  @IsString()
  content: string
}
