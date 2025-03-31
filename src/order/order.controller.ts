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
import { CancelOrderDto, CreateOrderDto, FindManyOrderDto, UpdateOrderDto } from './dto/order.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { SaveOrderDto } from './dto/save-order.dto'
import { RolesGuard } from 'guards/roles.guard'
import { PaymentOrderDto } from './dto/payment.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  create(@Body() data: CreateOrderDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req
    return this.orderService.create(data, accountId, branchId)
  }

  @Post('/:id/payment')
  @HttpCode(HttpStatus.OK)
  paymentOrder(@Param('id') id: string, @Body() data: PaymentOrderDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.orderService.payment(id, data, accountId, branchId)
  }

  @Patch('/:id/save')
  @HttpCode(HttpStatus.OK)
  saveOrder(@Param('id') id: string, @Body() data: SaveOrderDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req
    return this.orderService.save(id, data, accountId, branchId)
  }

  @Patch('/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string, @Body() data: CancelOrderDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req
    return this.orderService.cancel(id, data, accountId, branchId)
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  update(@Body() data: UpdateOrderDto, @Req() req: RequestJWT, @Param('id') id: string) {
    const { accountId, branchId } = req

    return this.orderService.update(id, data, accountId, branchId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyOrderDto, @Req() req: RequestJWT) {
    const { branchId } = req
    return this.orderService.findAll(data, branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.orderService.findUniq(id, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.orderService.deleteMany(data, accountId, branchId)
  }
}
