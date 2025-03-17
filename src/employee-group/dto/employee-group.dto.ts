import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateEmployeeGroupDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string
}

export class UpdateEmployeeGroupDto extends PartialType(
  CreateEmployeeGroupDto
) {}
