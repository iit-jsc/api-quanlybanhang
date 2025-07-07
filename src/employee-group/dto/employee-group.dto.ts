import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

export class CreateEmployeeGroupDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string

  description?: string
}

export class UpdateEmployeeGroupDto extends PartialType(CreateEmployeeGroupDto) {}
