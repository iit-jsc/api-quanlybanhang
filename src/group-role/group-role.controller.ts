import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { GroupRoleService } from './group-role.service';
import { FindManyGroupRoleDto } from './dto/group-role.dto';

@Controller('group-role')
export class GroupRoleController {
  constructor(private readonly groupRoleService: GroupRoleService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyGroupRoleDto) {
    return this.groupRoleService.findAll(data);
  }
}
