import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, MinLength } from 'class-validator'
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
  @MinLength(6)
  password: string

  @IsNotEmpty()
  shopName: string

  @IsNotEmpty()
  branchName: string

  address?: string
}
