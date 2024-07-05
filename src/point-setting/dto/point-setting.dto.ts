import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdatePointSettingDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  point: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsNumber()
  value: number;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @IsBoolean()
  active: boolean;
}
