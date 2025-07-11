import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, MaxLength } from 'class-validator'

export class CreateEmployeeGroupDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(50)
  name: string

  description?: string
}

export class UpdateEmployeeGroupDto extends PartialType(CreateEmployeeGroupDto) {}
