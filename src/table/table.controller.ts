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
import { TableService } from './table.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { DeleteManyDto } from 'utils/Common.dto'
import { CreateTableDto, FindManyTableDto, UpdateTableDto } from './dto/table.dto'
import { Roles } from 'guards/roles.decorator'
import { RolesGuard } from 'guards/roles.guard'
import { permissions } from 'enums/permissions.enum'
import { extractPermissions } from 'utils/Helps'

@Controller('table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.table.create)
  create(
    @Body() data: CreateTableDto,

    @Req() req: RequestJWT
  ) {
    const { accountId, branchId } = req

    return this.tableService.create(data, accountId, branchId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.table.update)
  update(@Param('id') id: string, @Body() data: UpdateTableDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.tableService.update(id, data, accountId, branchId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...extractPermissions(permissions.table))
  findAll(@Query() data: FindManyTableDto, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.tableService.findAll(data, branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: string) {
    return this.tableService.findUniq({
      id
    })
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.table.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.tableService.deleteMany(data, accountId, branchId)
  }
}
