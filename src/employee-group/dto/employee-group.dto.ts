import { PartialType } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateEmployeeGroupDto {
  @IsNotEmpty()
  name: string

  description?: string
}

export class UpdateEmployeeGroupDto extends PartialType(CreateEmployeeGroupDto) {}
