import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { RoleService } from './role.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { DeleteManyDto } from 'utils/Common.dto'
import { CreateRoleDto, FindManyRoleDto, UpdateRoleDto } from './dto/role.dto'
@Controller('role')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  create(@Body() data: CreateRoleDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.roleService.create(data, accountId, shopId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyRoleDto, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.roleService.findAll(data, shopId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() data: UpdateRoleDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.roleService.update(id, data, accountId, shopId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.roleService.findUniq(id, shopId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.roleService.deleteMany(data, accountId, shopId)
  }
}
