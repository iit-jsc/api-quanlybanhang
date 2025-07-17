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

import { EmployeeGroupService } from './employee-group.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { FindManyDto, DeleteManyDto } from 'utils/Common.dto'
import { CreateEmployeeGroupDto, UpdateEmployeeGroupDto } from './dto/employee-group.dto'
import { permissions } from 'enums/permissions.enum'
import { Roles } from 'guards/roles.decorator'
import { extractPermissions } from 'helpers'

@Controller('employee-group')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeGroupController {
  constructor(private readonly employeeGroupService: EmployeeGroupService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.employeeGroup.create)
  create(@Body() data: CreateEmployeeGroupDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.employeeGroupService.create(data, accountId, shopId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.employeeGroup))
  findAll(@Query() data: FindManyDto, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.employeeGroupService.findAll(data, shopId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.employeeGroup))
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.employeeGroupService.findUniq(id, shopId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.employeeGroup.update)
  update(@Param('id') id: string, @Body() data: UpdateEmployeeGroupDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.employeeGroupService.update(id, data, accountId, shopId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.employeeGroup.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.employeeGroupService.deleteMany(data, accountId, shopId)
  }
}
