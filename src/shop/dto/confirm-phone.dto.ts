import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates';

export class ConfirmPhoneDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  code: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsVietnamesePhoneNumber()
  @IsString()
  phone: string;
}
