import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

@Injectable()
export class BranchService {
  async createBranches(totalBranches: number, shopId: string, prisma: PrismaClient) {
    const branchPromises = Array.from({ length: totalBranches }, () =>
      prisma.branch.create({
        data: {
          shopId,
          name: faker.company.name(),
          photoURL: faker.image.avatar(),
          bannerURL: faker.image.imageUrl(),
          address: faker.location.streetAddress()
        }
      })
    )

    console.log('✅ Created branches!')
    return Promise.all(branchPromises)
  }
}
