import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { DiscountCodeService } from './discount-code.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { DeleteManyDto } from 'utils/Common.dto'
import { RequestJWT } from 'interfaces/common.interface'
import {
  CreateDiscountCodeDto,
  CheckAvailableDto,
  FindManyDiscountCodeDto
} from './dto/discount-code.dto'
import { permissions } from 'enums/permissions.enum'
import { Roles } from 'guards/roles.decorator'
import { extractPermissions } from 'utils/Helps'

@Controller('discount-code')
export class DiscountCodeController {
  constructor(private readonly discountCodeService: DiscountCodeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.discountCode.create)
  create(@Body() data: CreateDiscountCodeDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.discountCodeService.create(data, accountId, branchId)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...extractPermissions(permissions.discountCode))
  findAll(@Query() data: FindManyDiscountCodeDto, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.discountCodeService.findAll(data, branchId)
  }

  @Get(':id/check-available')
  @HttpCode(HttpStatus.OK)
  checkAvailable(@Body() data: CheckAvailableDto) {
    return this.discountCodeService.checkAvailable(data)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...extractPermissions(permissions.discountCode))
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.discountCodeService.findUniq(id, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.discountCode.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.discountCodeService.deleteMany(data, accountId, branchId)
  }
}
