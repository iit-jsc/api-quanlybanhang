import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự.' })
  password: string;

  status: number;
  username: string;
}
