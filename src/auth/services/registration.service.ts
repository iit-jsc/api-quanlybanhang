import { Injectable } from '@nestjs/common'
import { HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { AccountStatus, PrismaClient } from '@prisma/client'
import { RegisterDto } from '../dto/register.dto'
import { RoleService } from 'src/shop/services/role.service'
import { UserService } from 'src/shop/services/user.service'
import { CustomerService } from 'src/shop/services/customer.service'
import { ProductService } from 'src/shop/services/product.service'
import { AreaService } from 'src/shop/services/area.service'
import { PaymentMethodService } from 'src/shop/services/payment-method.service'
import { PasswordService } from './password.service'

// Constants
const TRANSACTION_TIMEOUT = 10_000
const TRANSACTION_MAX_WAIT = 5_000
const DEFAULT_BUSINESS_TYPE = 'FOOD_BEVERAGE'
const DEFAULT_TRIAL_DAYS = 7

@Injectable()
export class RegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
    private readonly productService: ProductService,
    private readonly areaService: AreaService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly passwordService: PasswordService
  ) {}

  async registerUser(data: RegisterDto) {
    // Check if phone number already exists
    await this.validatePhoneNotExists(data.phone)

    return this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        // Create user with shop and branch
        const user = await this.createUserWithShopAndBranch(data, prisma)

        const branchId = user.account.branches[0].id
        const shopId = user.account.branches[0].shopId

        // Setup roles and assign admin role
        await this.setupRolesAndPermissions(user.account.id, shopId, prisma)

        // Setup employee groups and customer types
        await this.setupGroupsAndTypes(shopId, prisma)

        // Setup branch data (products, areas, payment methods)
        await this.setupBranchData(branchId, prisma)

        return { success: true, userId: user.id, branchId, shopId }
      },
      {
        timeout: TRANSACTION_TIMEOUT,
        maxWait: TRANSACTION_MAX_WAIT
      }
    )
  }

  private async validatePhoneNotExists(phone: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      throw new HttpException('Số điện thoại đã được sử dụng!', HttpStatus.CONFLICT)
    }
  }

  private async createUserWithShopAndBranch(data: RegisterDto, prisma: PrismaClient) {
    const shopCode = this.generateShopCode(data.shopName)

    return await prisma.user.create({
      data: {
        name: data.fullName,
        phone: data.phone,
        account: {
          create: {
            password: this.passwordService.hashPassword(data.password),
            branches: {
              create: {
                name: data.branchName,
                address: data.address,
                expiryAt: this.calculateTrialExpiry(),
                shop: {
                  create: {
                    code: shopCode,
                    name: data.shopName,
                    address: data.address,
                    businessTypeCode: DEFAULT_BUSINESS_TYPE
                  }
                }
              }
            },
            status: AccountStatus.ACTIVE
          }
        }
      },
      select: {
        id: true,
        account: {
          select: {
            id: true,
            branches: {
              select: {
                id: true,
                shopId: true
              }
            }
          }
        }
      }
    })
  }

  private async setupRolesAndPermissions(accountId: string, shopId: string, prisma: PrismaClient) {
    const roles = await this.roleService.createRoles(shopId, prisma)
    const adminRole = roles.find(role => role.name === 'Quản trị viên')

    if (!adminRole) {
      throw new HttpException('Không thể tạo role admin!', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    await prisma.account.update({
      where: { id: accountId },
      data: {
        roles: {
          connect: { id: adminRole.id }
        }
      }
    })
  }

  private async setupGroupsAndTypes(shopId: string, prisma: PrismaClient) {
    await Promise.all([
      this.userService.createEmployeeGroups(shopId, prisma),
      this.customerService.createCustomerTypes(shopId, prisma)
    ])
  }

  private async setupBranchData(branchId: string, prisma: PrismaClient) {
    // Create measurement units first
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
      this.areaService.createAreas(branchId, prisma),
      this.paymentMethodService.createPaymentMethods(branchId, prisma),
      this.setupBranchSetting(branchId, prisma)
    ])
  }

  private async setupBranchSetting(branchId: string, prisma: PrismaClient) {
    // Create measurement units first
    await prisma.branchSetting.create({
      data: {
        branchId,
        useKitchen: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  private generateShopCode(shopName: string): string {
    return `${shopName.replace(/\s+/g, '-')}-${Date.now()}`
  }

  private calculateTrialExpiry(): Date {
    return new Date(Date.now() + DEFAULT_TRIAL_DAYS * 24 * 60 * 60 * 1000)
  }
}
