import { Injectable } from '@nestjs/common'
import { UpdateShopDto } from './dto/shop.dto'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async update(shopId: string, data: UpdateShopDto, accountId: string) {
    return await this.prisma.shop.update({
      where: { id: shopId },
      data: {
        name: data.name,
        updatedBy: accountId
      },
      include: {
        businessType: true
      }
    })
  }

  async getCurrentShop(shopId: string) {
    return this.prisma.shop.findUniqueOrThrow({
      where: { id: shopId },
      include: {
        businessType: true
      }
    })
  }
}
