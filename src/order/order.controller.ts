import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query
} from '@nestjs/common'
import { OrderService } from './order.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RequestJWT } from 'interfaces/common.interface'
import {
  CancelOrderDto,
  CreateOrderDto,
  FindManyOrderDto,
  SaveOrderDto,
  UpdateOrderDto
} from './dto/order.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { RolesGuard } from 'guards/roles.guard'
import { PaymentOrderDto } from './dto/payment.dto'
import { Roles } from 'guards/roles.decorator'
import { permissions } from 'enums/permissions.enum'
import { extractPermissions } from 'utils/Helps'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.order.create)
  create(@Body() data: CreateOrderDto, @Req() req: RequestJWT) {
    const { accountId, branchId, deviceId } = req
    return this.orderService.create(data, accountId, branchId, deviceId)
  }

  @Post('/:id/payment')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.order.payment)
  paymentOrder(@Param('id') id: string, @Body() data: PaymentOrderDto, @Req() req: RequestJWT) {
    const { accountId, branchId, deviceId } = req

    return this.orderService.payment(id, data, accountId, branchId, deviceId)
  }

  @Patch('/:id/save')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.order.save)
  saveOrder(@Param('id') id: string, @Body() data: SaveOrderDto, @Req() req: RequestJWT) {
    const { deviceId, branchId } = req
    return this.orderService.save(id, data, branchId, deviceId)
  }

  @Patch('/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.order.cancel)
  cancel(@Param('id') id: string, @Body() data: CancelOrderDto, @Req() req: RequestJWT) {
    const { accountId, branchId, deviceId } = req
    return this.orderService.cancel(id, data, accountId, branchId, deviceId)
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.order.update)
  update(@Body() data: UpdateOrderDto, @Req() req: RequestJWT, @Param('id') id: string) {
    const { accountId, branchId, deviceId } = req

    return this.orderService.update(id, data, accountId, branchId, deviceId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.order))
  findAll(@Query() data: FindManyOrderDto, @Req() req: RequestJWT) {
    const { branchId } = req
    return this.orderService.findAll(data, branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.order))
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.orderService.findUniq(id, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.order.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId, deviceId } = req

    return this.orderService.deleteMany(data, accountId, branchId, deviceId)
  }
}
