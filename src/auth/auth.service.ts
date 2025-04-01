import * as bcrypt from 'bcrypt'
import { Response } from 'express'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { LoginDto } from './dto/login.dto'
import { mapResponseLogin } from 'map-responses/account.map-response'
import { AnyObject, TokenPayload } from 'interfaces/common.interface'
import { AccessBranchDto } from './dto/access-branch.dto'
import { AccountStatus } from '@prisma/client'
import { userSortSelect } from 'responses/user.response'
import { roleSortSelect } from 'responses/role.response'
import { accountLoginSelect, accountSortSelect } from 'responses/account.response'
import { shopLoginSelect } from 'responses/shop.response'
import { ChangeMyPasswordDto } from './dto/change-password.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService
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

    if (account.status == AccountStatus.INACTIVE)
      throw new HttpException('Tài khoản đã bị khóa!', HttpStatus.FORBIDDEN)

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
      this.createRefreshToken(accountId, data)
    ])

    const currentShop = this.getCurrentShopFromShops(shops, data.branchId)

    // set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/auth/refresh-token'
    })

    return {
      accessToken: await this.jwtService.signAsync(
        {
          accountId,
          branchId: data.branchId
        },
        {
          expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN,
          secret: process.env.SECRET_KEY
        }
      ),
      refreshToken,
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
        user: {
          select: userSortSelect
        },
        role: {
          select: roleSortSelect
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

  async createRefreshToken(accountId: string, accessBranchDto: AccessBranchDto) {
    // Tạo refresh token
    return await this.jwtService.signAsync(
      {
        accountId: accountId,
        branchId: accessBranchDto.branchId
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
      select: accountSortSelect
    })
  }
}
