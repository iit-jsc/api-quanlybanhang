import { PermissionGroupType } from '@prisma/client'
import { IsEnum, IsNotEmpty } from 'class-validator'
import { FindManyDto } from 'utils/Common.dto'

export class FindManyPermissionGroupDto extends FindManyDto {}

export class CreatePermissionGroupDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  code: string

  @IsNotEmpty()
  @IsEnum(PermissionGroupType)
  type: PermissionGroupType
}
