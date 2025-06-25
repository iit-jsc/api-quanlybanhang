import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateDataSampleDto, UpdateBranchDto } from './dto/create-branch.dto'
import { PrismaClient } from '@prisma/client'
import { AreaService, ProductService } from 'src/shop/services'

const DEFAULT_BUSINESS_TYPE = 'FOOD_BEVERAGE'

@Injectable()
export class BranchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
    private readonly areaService: AreaService
  ) {}

  async getCurrentBranch(id: string) {
    return await this.prisma.branch.findUniqueOrThrow({
      where: {
        id
      }
    })
  }

  async updateCurrentBranch(data: UpdateBranchDto, branchId: string, accountId: string) {
    const branch = await this.prisma.branch.update({
      data: {
        name: data.name,
        address: data.address,
        photoURL: data.photoURL,
        bannerURL: data.bannerURL,
        phone: data.phone,
        updatedBy: accountId
      },
      where: {
        id: branchId
      }
    })

    return branch
  }

  async setupBranchDataSample(data: CreateDataSampleDto, branchId: string) {
    // Create measurement units first
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      if (data.isAgreed) {
        const measurementUnits = await this.productService.createMeasurementUnit(
          DEFAULT_BUSINESS_TYPE,
          branchId,
          prisma
        )
        // Create product types and other branch data in parallel
        await Promise.all([
          this.productService.createProductTypes(
            DEFAULT_BUSINESS_TYPE,
            branchId,
            measurementUnits.map(unit => unit.id),
            prisma
          ),
          this.areaService.createAreas(branchId, prisma)
        ])
      }

      await prisma.branchSetting.update({
        where: { branchId },
        data: { isSampleDataEnabled: true }
      })
    })
  }
}
