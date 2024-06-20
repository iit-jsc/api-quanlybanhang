import { Transform, TransformFnParams } from 'class-transformer';
import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateMeasurementUnitDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  code?: string;
}
