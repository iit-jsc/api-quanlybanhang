import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common'
import { ShopService } from './shop.service'
import { CreateShopDto } from './dto/shop.dto'

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  registerShop(@Body() data: CreateShopDto) {
    return this.shopService.create(data)
  }
}
