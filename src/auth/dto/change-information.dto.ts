import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class ChangeAvatarDto {
  @IsOptional()
  @IsString()
  photoURL: string
}
