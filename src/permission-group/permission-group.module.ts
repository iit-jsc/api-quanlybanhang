import { Module } from '@nestjs/common'
import { PermissionGroupController } from './permission-group.controller'
import { PermissionGroupService } from './permission-group.service'

@Module({
  controllers: [PermissionGroupController],
  providers: [PermissionGroupService]
})
export class PermissionGroupModule {}
