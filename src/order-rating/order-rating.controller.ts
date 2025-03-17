import { Controller } from '@nestjs/common'
import { OrderRatingService } from './order-rating.service'

@Controller('order-rating')
export class OrderRatingController {
  constructor(private readonly orderRatingService: OrderRatingService) {}

  // @Post('/')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtCustomerAuthGuard)
  // create(@Body() createOrderRatingDto: CreateOrderRatingDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenCustomerPayload

  //   return this.orderRatingService.create(createOrderRatingDto, tokenPayload)
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtCustomerAuthGuard)
  // update(
  //   @Param('id') id: string,
  //   @Body() updateOrderRatingDto: UpdateOrderRatingDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenCustomerPayload

  //   return this.orderRatingService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updateOrderRatingDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtCustomerAuthGuard)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenCustomerPayload

  //   return this.orderRatingService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // findAll(@Query() data: FindManyOrderRatings, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenCustomerPayload

  //   return this.orderRatingService.findAll(data, tokenPayload)
  // }
}
