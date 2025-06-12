import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, MinLength, IsString } from 'class-validator'
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates'

export class RegisterDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsVietnamesePhoneNumber()
  phone: string

  @IsNotEmpty()
  fullName: string

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(6, {
    message: 'Mật khẩu phải có ít nhất 6 ký tự'
  })
  password: string

  @IsNotEmpty()
  shopName: string

  @IsNotEmpty()
  branchName: string

  @IsNotEmpty()
  address: string

  @IsNotEmpty()
  @IsString()
  captchaToken: string
}
