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
import { VatGroupService } from './vat-group.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { FindManyDto, DeleteManyDto } from 'utils/Common.dto'
import { CreateVatGroupDto, UpdateVatGroupDto } from './dto/vat-group.dto'

@UseGuards(JwtAuthGuard)
@Controller('vat-group')
export class VatGroupController {
  constructor(private readonly vatGroupService: VatGroupService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  create(@Body() data: CreateVatGroupDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.vatGroupService.create(data, accountId, branchId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyDto, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.vatGroupService.findAll(data, branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.vatGroupService.findUniq(id, branchId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() data: UpdateVatGroupDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.vatGroupService.update(id, data, accountId, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.vatGroupService.deleteMany(data, accountId, branchId)
  }
}
