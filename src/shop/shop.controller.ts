import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Req, UseGuards } from '@nestjs/common'
import { ShopService } from './shop.service'
import { UpdateShopDto } from './dto/shop.dto'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RequestJWT } from 'interfaces/common.interface'

@Controller('shop')
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  updateShop(@Body() data: UpdateShopDto, @Req() req: RequestJWT) {
    const { shopId, accountId } = req

    return this.shopService.update(shopId, data, accountId)
  }

  @Get('/current')
  @HttpCode(HttpStatus.OK)
  getShopById(@Req() req: RequestJWT) {
    const { shopId } = req
    return this.shopService.getCurrentShop(shopId)
  }
}
