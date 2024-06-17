import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ACCOUNT_STATUS } from 'enums/user.enum';

export class CreateAccountDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự.' })
  password: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(ACCOUNT_STATUS, { message: 'Trạng thái không hợp lệ!' })
  status: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Type(() => Number)
  userId: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Type(() => Number)
  type: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @ArrayNotEmpty({ message: 'Danh sách quyền không được rỗng!' })
  permissionIds: number[];
}
