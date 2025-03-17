import { IsString, IsOptional } from 'class-validator'

export class ChangeAvatarDto {
  @IsOptional()
  @IsString()
  photoURL: string
}
