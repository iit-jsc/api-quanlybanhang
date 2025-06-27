import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { PrismaClient } from '@prisma/client'
import { CreateShopDto } from '../dto/shop.dto'
import { BranchService } from './branch.service'
import { RoleService } from './role.service'
import { UserService } from './user.service'
import { CustomerService } from './customer.service'
import { AreaService } from './area.service'
import { PaymentMethodService } from './payment-method.service'
import { ProductService } from './product.service'

// Constants
const TRANSACTION_TIMEOUT = 10_000
const TRANSACTION_MAX_WAIT = 5_000

@Injectable()
export class ShopSetupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchService: BranchService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
    private readonly areaService: AreaService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly productService: ProductService
  ) {}

  async setupNewShop(data: CreateShopDto) {
    console.log('🌱 Setting up shop data...')

    return await this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        // Create shop
        const newShop = await this.createShop(data, prisma)

        // Create branches and roles in parallel
        const [newBranches, newRoles] = await Promise.all([
          this.branchService.createBranches(data.totalBranches, newShop.id, prisma),
          this.roleService.createRoles(newShop.id, prisma)
        ])

        const adminRole = newRoles.find(role => role.name === 'Quản trị viên')

        // Create user, employee groups, and customer types in parallel
        await Promise.all([
          this.userService.createUser(
            data.user,
            newBranches.map(branch => branch.id),
            adminRole.id,
            prisma
          ),
          this.userService.createEmployeeGroups(newShop.id, prisma),
          this.customerService.createCustomerTypes(newShop.id, prisma)
        ])

        // Setup each branch
        await this.setupBranches(newBranches, newShop.businessType.code, prisma)

        return { success: true, shop: newShop }
      },
      {
        timeout: TRANSACTION_TIMEOUT,
        maxWait: TRANSACTION_MAX_WAIT
      }
    )
  }

  private async createShop(data: CreateShopDto, prisma: PrismaClient) {
    const newShop = await prisma.shop.create({
      data: {
        name: data.name,
        code: data.code,
        businessTypeCode: data.businessTypeCode
      },
      include: {
        businessType: true
      }
    })

    console.log('✅ Created new shop!')
    return newShop
  }

  private async setupBranches(branches: any[], businessTypeCode: string, prisma: PrismaClient) {
    return await Promise.all(
      branches.map(async branch => {
        // Create measurement units first
        const measurementUnits = await this.productService.createMeasurementUnit(
          businessTypeCode,
          branch.id,
          prisma
        )

        // Create product types with products
        await this.productService.createProductTypes(
          businessTypeCode,
          branch.id,
          measurementUnits.map(unit => unit.id),
          prisma
        )

        // Create areas, payment methods, and product options in parallel
        await Promise.all([
          this.areaService.createAreas(branch.id, prisma),
          this.paymentMethodService.createPaymentMethods(branch.id, prisma)
        ])
      })
    )
  }
}
