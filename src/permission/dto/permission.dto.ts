import { Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

export class CreatePermissionDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
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
