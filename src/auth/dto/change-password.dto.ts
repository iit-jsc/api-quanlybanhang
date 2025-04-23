import { IsString, IsNotEmpty } from 'class-validator'

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  newPassword: string
}

export class ChangeMyPasswordDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  newPassword: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  oldPassword: string
}
