import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, MinLength } from 'class-validator'
import { IsVietnamesePhoneNumber } from 'utils/CustomValidates'

export class RegisterDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsVietnamesePhoneNumber()
  phone: string

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  fullName: string

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(6)
  password: string

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shopName: string

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  branchName: string

  address?: string
}
