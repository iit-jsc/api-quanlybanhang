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
import { MeasurementUnitService } from './measurement-unit.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { FindManyDto, DeleteManyDto } from 'utils/Common.dto'
import { CreateMeasurementUnitDto, UpdateMeasurementUnitDto } from './dto/measurement-unit.dto'
import { Roles } from 'guards/roles.decorator'
import { permissions } from 'enums/permissions.enum'
import { extractPermissions } from 'helpers'
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('measurement-unit')
export class MeasurementUnitController {
  constructor(private readonly measurementUnitService: MeasurementUnitService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.measurementUnit.create)
  create(@Body() data: CreateMeasurementUnitDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.measurementUnitService.create(data, accountId, branchId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.measurementUnit))
  findAll(@Query() data: FindManyDto, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.measurementUnitService.findAll(data, branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.measurementUnit))
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.measurementUnitService.findUniq(id, branchId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.measurementUnit.update)
  update(@Param('id') id: string, @Body() data: UpdateMeasurementUnitDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.measurementUnitService.update(id, data, accountId, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.measurementUnit.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.measurementUnitService.deleteMany(data, accountId, branchId)
  }
}
