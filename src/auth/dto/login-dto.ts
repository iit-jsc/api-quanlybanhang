import { Transform, TransformFnParams } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  password: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  shopId: number;
}
