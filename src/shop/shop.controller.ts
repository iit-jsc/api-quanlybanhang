import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ShopService } from './shop.service';
import { RegisterShopDto } from './dto/create-shop.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  registerShop(@Body() createShopDto: RegisterShopDto) {
    return this.shopService.registerShop(createShopDto);
  }
}
