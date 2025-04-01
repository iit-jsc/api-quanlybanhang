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

@Controller('employee-group')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeGroupController {
  constructor(private readonly employeeGroupService: EmployeeGroupService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  create(@Body() data: CreateEmployeeGroupDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.employeeGroupService.create(data, accountId, shopId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyDto, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.employeeGroupService.findAll(data, shopId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.employeeGroupService.findUniq(id, shopId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() data: UpdateEmployeeGroupDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.employeeGroupService.update(id, data, accountId, shopId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.employeeGroupService.deleteMany(data, accountId, shopId)
  }
}
