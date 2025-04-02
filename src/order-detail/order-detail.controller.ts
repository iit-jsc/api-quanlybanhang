import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Query, Req } from '@nestjs/common'
import { OrderDetailService } from './order-detail.service'
import { DeleteManyDto } from 'utils/Common.dto'
import { FindManyOrderDetailDto } from './dto/order-detail.dto'
import { RequestJWT } from 'interfaces/common.interface'

@Controller('order-detail')
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}

  @Delete('')
  @HttpCode(HttpStatus.OK)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.orderDetailService.deleteMany(data, accountId, branchId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyOrderDetailDto, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.orderDetailService.findAll(data, branchId)
  }
}
