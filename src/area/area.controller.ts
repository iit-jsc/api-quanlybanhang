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
import { AreaService } from './area.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { CreateAreaDto, FindManyAreaDto, UpdateAreaDto } from './dto/area.dto'
import { RequestJWT } from 'interfaces/common.interface'
import { DeleteManyDto } from 'utils/Common.dto'
import { RolesGuard } from 'guards/roles.guard'
import { Roles } from 'guards/roles.decorator'
import { extractPermissions } from 'utils/Helps'
import { permissions } from 'enums/permissions.enum'

@Controller('area')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.area.create)
  create(@Body() data: CreateAreaDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.areaService.create(data, accountId, branchId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.area.update)
  update(@Param('id') id: string, @Body() data: UpdateAreaDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.areaService.update(id, data, accountId, branchId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.area))
  findAll(@Query() data: FindManyAreaDto, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.areaService.findAll(data, branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.area))
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.areaService.findUniq(id, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.area.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.areaService.deleteMany(data, accountId, branchId)
  }
}
