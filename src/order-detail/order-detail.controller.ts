import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { OrderDetailService } from './order-detail.service'
import { DeleteManyDto } from 'utils/Common.dto'
import {
  CancelOrderDetailsDto,
  FindManyOrderDetailDto,
  UpdateOrderDetailDto,
  UpdateStatusOrderDetailsDto
} from './dto/order-detail.dto'
import { RequestJWT } from 'interfaces/common.interface'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { Roles } from 'guards/roles.decorator'
import { permissions } from 'enums/permissions.enum'
import { extractPermissions } from 'utils/Helps'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order-detail')
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.order.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId, deviceId } = req

    return this.orderDetailService.deleteMany(data, accountId, branchId, deviceId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.order))
  findAll(@Query() data: FindManyOrderDetailDto, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.orderDetailService.findAll(data, branchId)
  }

  @Patch('/change-status')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.order.update)
  updateStatusOrderDetails(@Body() data: UpdateStatusOrderDetailsDto, @Req() req: RequestJWT) {
    const { accountId, branchId, deviceId } = req

    return this.orderDetailService.updateStatusOrderDetails(data, accountId, branchId, deviceId)
  }

  @Patch('/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.order.cancel)
  cancel(@Body() data: CancelOrderDetailsDto, @Req() req: RequestJWT, @Param('id') id: string) {
    const { accountId, branchId, deviceId } = req

    return this.orderDetailService.cancel(id, data, accountId, branchId, deviceId)
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.order.update)
  update(@Body() data: UpdateOrderDetailDto, @Req() req: RequestJWT, @Param('id') id: string) {
    const { accountId, branchId, deviceId } = req

    return this.orderDetailService.update(id, data, accountId, branchId, deviceId)
  }
}
