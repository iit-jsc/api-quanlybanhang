import { PartialType } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsArray()
  @IsOptional()
  permissionCodes: string[]

  description?: string
}

export class FindManyRoleDto extends FindManyDto {}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
