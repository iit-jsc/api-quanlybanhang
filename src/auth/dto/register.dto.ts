import { Transform, TransformFnParams } from 'class-transformer'
import { IsString, IsNotEmpty } from 'class-validator'

export class RegisterDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  phone: string
}
