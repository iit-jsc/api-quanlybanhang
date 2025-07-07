import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreateRoleDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string

  @IsNotEmpty()
  @IsArray()
  @IsOptional()
  permissionCodes: string[]

  description?: string
}

export class FindManyRoleDto extends FindManyDto {}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
