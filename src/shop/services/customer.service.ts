import { Injectable } from '@nestjs/common'
import { PrismaClient, DiscountType } from '@prisma/client'

@Injectable()
export class CustomerService {
  async createCustomerTypes(shopId: string, prisma: PrismaClient) {
    const customerTypes = [
      {
        name: 'Khách VIP',
        description: 'Khách hàng thân thiết, được hưởng nhiều ưu đãi.',
        discount: 10,
        discountType: DiscountType.PERCENT
      },
      {
        name: 'Khách vãng lai',
        description: 'Khách hàng không có ưu đãi đặc biệt.',
        discount: 0,
        discountType: DiscountType.VALUE
      }
    ]

    const createdCustomerTypes = await Promise.all(
      customerTypes.map(customerType =>
        prisma.customerType.create({
          data: {
            name: customerType.name,
            description: customerType.description,
            discount: customerType.discount,
            discountType: customerType.discountType,
            shopId: shopId
          }
        })
      )
    )

    console.log('✅ Created customer types!')
    return createdCustomerTypes
  }
}
