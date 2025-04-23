import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { PermissionService } from './permission.service'
import { AddPermissionToAllRolesDto, CreatePermissionDto } from './dto/permission.dto'

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('add-to-all-roles')
  @HttpCode(HttpStatus.OK)
  addPermissionToAllRoles(@Body() data: AddPermissionToAllRolesDto) {
    return this.permissionService.addPermissionToAllRoles(data)
  }

  @Post('')
  @HttpCode(HttpStatus.OK)
  create(@Body() data: CreatePermissionDto) {
    return this.permissionService.create(data)
  }
}
