import { Controller } from '@nestjs/common'
import { OrderDetailService } from './order-detail.service'

@Controller('order-detail')
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}

  // @Patch('/:id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('UPDATE_ORDER', SPECIAL_ROLE.MANAGER)
  // update(
  //   @Body() updateOrderProductDto: UpdateOrderProductDto,
  //   @Req() req: any,
  //   @Param('id') id: string
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.orderDetailService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updateOrderProductDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('DELETE_ORDER', SPECIAL_ROLE.MANAGER)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.orderDetailService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // @Roles('VIEW_ORDER', SPECIAL_ROLE.MANAGER)
  // findAll(@Query() data: FindManyOrderDetailDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.orderDetailService.findAll(data, tokenPayload)
  // }
}
