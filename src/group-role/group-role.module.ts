import { Module } from '@nestjs/common';
import { GroupRoleService } from './group-role.service';
import { GroupRoleController } from './group-role.controller';

@Module({
  controllers: [GroupRoleController],
  providers: [GroupRoleService],
})
export class GroupRoleModule {}
