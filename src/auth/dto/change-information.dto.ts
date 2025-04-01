import { IsString, IsOptional } from 'class-validator'

export class ChangeMyInformation {
  @IsOptional()
  @IsString()
  photoURL: string
}
