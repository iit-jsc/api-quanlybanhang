import { IsString, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  newPassword: string;
}
