import { IsNotEmpty } from 'class-validator'

export class CreatePermissionDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  code: string

  @IsNotEmpty()
  permissionGroupCode: string
}

export class AddPermissionToAllRolesDto {
  @IsNotEmpty()
  permissionCode: string
}
