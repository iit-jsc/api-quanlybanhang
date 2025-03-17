import { Controller } from '@nestjs/common'
import { GroupRoleService } from './group-role.service'

@Controller('group-role')
export class GroupRoleController {
  constructor(private readonly groupRoleService: GroupRoleService) {}

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // findAll(@Query() data: FindManyGroupRoleDto) {
  //   return this.groupRoleService.findAll(data)
  // }
}
