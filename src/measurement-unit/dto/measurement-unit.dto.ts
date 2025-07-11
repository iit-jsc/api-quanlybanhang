import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateMeasurementUnitDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MaxLength(25)
  name: string

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  @MaxLength(10)
  code?: string
}

export class UpdateMeasurementUnitDto extends PartialType(CreateMeasurementUnitDto) {}
