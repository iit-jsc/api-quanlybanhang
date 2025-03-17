import { IsNotEmpty, IsString } from 'class-validator'

export class CombineTableDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  fromTableId: string

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsString()
  toTableId: string
}
