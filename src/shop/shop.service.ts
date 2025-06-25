import { Injectable } from '@nestjs/common'
import { CreateShopDto } from './dto/shop.dto'
import { ShopSetupService } from './services/shop-setup.service'

@Injectable()
export class ShopService {
  constructor(private readonly shopSetupService: ShopSetupService) {}

  async create(data: CreateShopDto) {
    return await this.shopSetupService.setupNewShop(data)
  }
}
