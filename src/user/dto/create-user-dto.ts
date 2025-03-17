import { Transform, TransformFnParams } from 'class-transformer'
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString
} from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  username: string

  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng.'
    }
  )
  @IsOptional()
  email?: string

  @IsPhoneNumber('VN')
  phone?: string

  @IsOptional()
  @IsNumber()
  type?: number

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  password: string
}
