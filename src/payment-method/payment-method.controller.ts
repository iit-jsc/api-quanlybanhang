import {
  Body,
  Controller,
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
import { PaymentMethodService } from './payment-method.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import {
  CreatePaymentMethodDto,
  FindManyPaymentMethodDto,
  UpdatePaymentMethodDto
} from './dto/payment-method.dto'
import { Roles } from 'guards/roles.decorator'
import { permissions } from 'enums/permissions.enum'
import { extractPermissions } from 'utils/Helps'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.paymentMethod))
  findAll(@Query() data: FindManyPaymentMethodDto, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.paymentMethodService.findAll(data, branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.paymentMethod))
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.paymentMethodService.findUniq(id, branchId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.paymentMethod.update)
  update(@Param('id') id: string, @Body() data: UpdatePaymentMethodDto, @Req() req: RequestJWT) {
    const { branchId, accountId } = req

    return this.paymentMethodService.update(id, data, accountId, branchId)
  }

  @Post('')
  @HttpCode(HttpStatus.OK)
  create(@Body() data: CreatePaymentMethodDto, @Req() req: RequestJWT) {
    const { branchId, accountId } = req

    return this.paymentMethodService.create(data, accountId, branchId)
  }
}
