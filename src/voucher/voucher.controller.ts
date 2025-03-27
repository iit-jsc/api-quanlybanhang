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
import { VoucherService } from './voucher.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { DeleteManyDto } from 'utils/Common.dto'
import { CreateVoucherDto, FindManyVoucherDto, UpdateVoucherDto } from './dto/voucher.dto'
import { permissions } from 'enums/permissions.enum'
import { Roles } from 'guards/roles.decorator'

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.voucher.create)
  create(@Body() data: CreateVoucherDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.voucherService.create(data, accountId, branchId)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyVoucherDto) {
    return this.voucherService.findAll(data)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: string) {
    return this.voucherService.findUniq(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.voucher.update)
  update(@Param('id') id: string, @Body() data: UpdateVoucherDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.voucherService.update(id, data, accountId, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.voucher.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.voucherService.deleteMany(data, accountId, branchId)
  }
}
