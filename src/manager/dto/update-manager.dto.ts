import { PartialType } from '@nestjs/swagger';
import { CreateManagerDto } from './create-manager.dto';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { ACCOUNT_STATUS } from 'enums/user.enum';

export class UpdateManagerDto extends PartialType(CreateManagerDto) {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự.' })
  newPassword: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(ACCOUNT_STATUS, { message: 'Trạng thái không hợp lệ!' })
  accountStatus: number;
}
