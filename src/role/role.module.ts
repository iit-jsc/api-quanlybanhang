import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleController } from './role.controller'

@Module({
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService],
  imports: []
})
export class RoleModule {}
