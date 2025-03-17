import { PartialType } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'Không được để trống!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsArray()
  @IsOptional()
  roleCodes: string[]
}

export class FindManyPermissionDto extends FindManyDto {}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
