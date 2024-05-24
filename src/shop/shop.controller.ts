import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopService.create(createShopDto);
  }
}
