import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { GroupRoleService } from './group-role.service';
import { FindManyDto } from 'utils/Common.dto';

@Controller('group-role')
export class GroupRoleController {
  constructor(private readonly groupRoleService: GroupRoleService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() findManyDto: FindManyDto) {
    return this.groupRoleService.findAll(findManyDto);
  }
}
