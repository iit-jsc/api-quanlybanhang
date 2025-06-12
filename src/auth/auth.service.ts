import * as bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { Response } from 'express'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { LoginDto } from './dto/login.dto'
import { mapResponseLogin } from 'map-responses/account.map-response'
import { AnyObject, TokenPayload } from 'interfaces/common.interface'
import { AccessBranchDto } from './dto/access-branch.dto'
import { AccountStatus, PrismaClient } from '@prisma/client'
import { userShortSelect } from 'responses/user.response'
import { roleSelect } from 'responses/role.response'
import { accountLoginSelect, accountShortSelect } from 'responses/account.response'
import { shopLoginSelect } from 'responses/shop.response'
import { ChangeMyPasswordDto } from './dto/change-password.dto'
import { RegisterDto } from './dto/register.dto'
import { ShopService } from 'src/shop/shop.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private readonly shopService: ShopService
  ) {}

  async login(data: LoginDto) {
    const account = await this.prisma.account.findFirst({
      where: {
        user: {
          OR: [
            {
              phone: data.username
            },
            {
              email: data.username
            }
          ]
        }
      },
      select: accountLoginSelect
    })

    if (!account || !(await bcrypt.compare(data.password, account.password)))
      throw new HttpException('Tài khoản hoặc mật khẩu không chính xác!', HttpStatus.UNAUTHORIZED)

    if (account.status == AccountStatus.INACTIVE || account.status == AccountStatus.DELETED)
      throw new HttpException('Tài khoản đã bị khóa hoặc đã bị xóa!', HttpStatus.FORBIDDEN)

    const shops = await this.getShopsByAccountId(account.id)

    return {
      accountToken: await this.jwtService.signAsync(
        { accountId: account.id },
        {
          expiresIn: process.env.EXPIRES_IN_ACCOUNT_TOKEN,
          secret: process.env.SECRET_KEY
        }
      ),
      shops
    }
  }

  async accessBranch(accountId: string, data: AccessBranchDto, res: Response) {
    const account = await this.getAccountAccess(accountId, data.branchId)

    if (!account) throw new HttpException('Không tìm thấy tài nguyên!', HttpStatus.NOT_FOUND)

    const [shops, refreshToken] = await Promise.all([
      this.getShopsByAccountId(accountId),
      this.createRefreshToken(accountId, data.branchId)
    ])

    const currentShop = this.getCurrentShopFromShops(shops, data.branchId)

    if (!currentShop.branches[0].expiryAt && currentShop.branches[0].expiryAt < new Date())
      throw new HttpException('Đã hết thời gian sử dụng!', HttpStatus.BAD_REQUEST)

    // set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh-token'
    })

    const deviceId = uuidv4()

    return {
      accessToken: await this.jwtService.signAsync(
        {
          accountId,
          branchId: data.branchId,
          deviceId
        },
        {
          expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN,
          secret: process.env.SECRET_KEY
        }
      ),
      ...mapResponseLogin({ account, shops, currentShop })
    }
  }

  async getMe(token: string) {
    try {
      const payload: TokenPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY
      })

      const shops = await this.getShopsByAccountId(payload.accountId)

      const currentShop = this.getCurrentShopFromShops(shops, payload.branchId)

      const account = await this.getAccountAccess(payload.accountId, payload.branchId)

      if (account.status == AccountStatus.INACTIVE || account.status == AccountStatus.DELETED)
        throw new HttpException('Tài khoản đã bị khóa hoặc đã bị xóa!', HttpStatus.FORBIDDEN)

      if (!account) throw new HttpException('Không tìm thấy tài nguyên!', HttpStatus.NOT_FOUND)

      return { ...mapResponseLogin({ account, shops, currentShop }) }
    } catch (error) {
      throw new HttpException('Phiên bản đăng nhập hết hạn!', HttpStatus.UNAUTHORIZED)
    }
  }

  getCurrentShopFromShops(shops: AnyObject[], branchId: string) {
    return shops
      .map(shop => {
        const branch = shop.branches.find(branch => branch.id === branchId)
        return branch ? { ...shop, branches: [branch] } : null
      })
      .filter(Boolean)[0]
  }

  async getAccountAccess(accountId: string, branchId: string) {
    return await this.prisma.account.findUnique({
      where: {
        id: accountId,
        status: AccountStatus.ACTIVE,
        branches: {
          some: {
            id: branchId
          }
        }
      },
      select: {
        id: true,
        status: true,
        user: {
          select: userShortSelect
        },
        roles: {
          select: roleSelect
        }
      }
    })
  }

  async getShopsByAccountId(id: string) {
    return await this.prisma.shop.findMany({
      where: {
        branches: {
          some: {
            accounts: {
              some: {
                id
              }
            }
          }
        }
      },
      select: shopLoginSelect(id)
    })
  }

  async createRefreshToken(accountId: string, branchId: string) {
    // Tạo refresh token
    return await this.jwtService.signAsync(
      {
        accountId: accountId,
        branchId: branchId
      },
      {
        expiresIn: process.env.EXPIRES_IN_REFRESH_TOKEN,
        secret: process.env.SECRET_KEY
      }
    )
  }

  async changeMyPassword(data: ChangeMyPasswordDto, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId
      }
    })

    if (!account || !bcrypt.compareSync(data.oldPassword, account.password))
      throw new HttpException('Mật khẩu cũ không chính xác!', HttpStatus.CONFLICT)

    return await this.prisma.account.update({
      where: {
        id: accountId
      },
      data: {
        password: bcrypt.hashSync(data.newPassword, 10)
      },
      select: accountShortSelect
    })
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken)
      throw new HttpException('Không tìm thấy token hoặc đã hết hạn!', HttpStatus.NOT_FOUND)

    try {
      const payload: TokenPayload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.SECRET_KEY
      })

      const shops = await this.getShopsByAccountId(payload.accountId)

      const currentShop = this.getCurrentShopFromShops(shops, payload.branchId)

      const account = await this.getAccountAccess(payload.accountId, payload.branchId)

      const accessToken = await this.jwtService.signAsync(
        {
          accountId: payload.accountId,
          branchId: payload.branchId
        },
        {
          expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN,
          secret: process.env.SECRET_KEY
        }
      )

      if (!account) throw new HttpException('Không tìm thấy tài nguyên!', HttpStatus.NOT_FOUND)

      return { ...mapResponseLogin({ account, shops, currentShop }), accessToken }
    } catch (error) {
      throw error
    }
  }

  async logout(deviceId: string) {
    await this.prisma.accountSocket.delete({
      where: {
        deviceId
      }
    })
    return
  }

  async register(data: RegisterDto) {
    return this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        const shopCode = data.shopName.replace(/\s+/g, '-') + '-' + Date.now()

        const user = await prisma.user.create({
          data: {
            name: data.fullName,
            phone: data.phone,
            account: {
              create: {
                password: bcrypt.hashSync(data.password, 10),
                branches: {
                  create: {
                    name: data.branchName,
                    address: data.address,
                    expiryAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    shop: {
                      create: {
                        code: shopCode,
                        name: data.shopName,
                        address: data.address,
                        businessTypeCode: 'FOOD_BEVERAGE'
                      }
                    }
                  }
                },
                status: AccountStatus.ACTIVE
              }
            }
          },
          select: {
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

        const branchId = user.account.branches[0].id
        const shopId = user.account.branches[0].shopId

        // Tạo nhóm người dùng
        const newRoles = await this.shopService.createRoles(shopId, prisma)
        const adminRole = newRoles.find(role => role.name === 'Quản trị viên')

        // Gán role admin cho account vừa tạo, tạo Nhóm nhân viên / nhóm khách hàng
        await Promise.all([
          prisma.account.update({
            where: { id: user.account.id },
            data: {
              roles: {
                connect: { id: adminRole.id }
              }
            }
          }),
          this.shopService.createEmployeeGroups(shopId, prisma),
          this.shopService.createCustomerTypes(shopId, prisma)
        ])

        // Tạo các đơn vị đo, loại sản phẩm và khu vực cho chi nhánh vừa tạo
        const measurementUnits = await this.shopService.createMeasurementUnit(
          'FOOD_BEVERAGE',
          branchId,
          prisma
        )

        // Tạo các đơn vị đo, loại sản phẩm và khu vực cho từng chi nhánh trong phạm vi giao dịch
        await Promise.all([
          this.shopService.createProductTypes(
            'FOOD_BEVERAGE',
            branchId,
            measurementUnits.map(item => item.id),
            prisma
          ),
          this.shopService.createAreas(branchId, prisma),
          this.shopService.createPaymentMethods(branchId, prisma)
        ])

        return
      },
      {
        maxWait: 5000,
        timeout: 10000
      }
    )
  }
}
