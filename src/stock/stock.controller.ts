import { Controller } from '@nestjs/common'

@Controller('stock')
export class StockController {
  // constructor(private readonly stockService: StockService) {}
  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // findAll(@Query() data: FindManyStockDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.stockService.findAll(data, tokenPayload)
  // }
}
