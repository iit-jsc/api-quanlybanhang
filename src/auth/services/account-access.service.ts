import { Injectable } from '@nestjs/common'
import { HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { AccountStatus } from '@prisma/client'
import { AnyObject } from 'interfaces/common.interface'
import { userShortSelect } from 'responses/user.response'
import { roleSelect } from 'responses/role.response'
import { shopLoginSelect } from 'responses/shop.response'

@Injectable()
export class AccountAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccountAccess(accountId: string, branchId: string) {
    return await this.prisma.account.findUnique({
      where: {
        id: accountId,
        status: AccountStatus.ACTIVE,
        branches: {
          some: { id: branchId }
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

  async getShopsByAccountId(accountId: string) {
    return await this.prisma.shop.findMany({
      where: {
        branches: {
          some: {
            accounts: {
              some: { id: accountId }
            }
          }
        }
      },
      select: shopLoginSelect(accountId)
    })
  }

  getCurrentShopFromShops(shops: AnyObject[], branchId: string) {
    return shops
      .map(shop => {
        const branch = shop.branches.find(branch => branch.id === branchId)
        return branch ? { ...shop, branches: [branch] } : null
      })
      .filter(Boolean)[0]
  }

  validateAccountStatus(account: any): void {
    if (account.status === AccountStatus.INACTIVE || account.status === AccountStatus.DELETED) {
      throw new HttpException('Tài khoản đã bị khóa hoặc đã bị xóa!', HttpStatus.FORBIDDEN)
    }
  }

  validateAccountExists(account: any): void {
    if (!account) {
      throw new HttpException('Không tìm thấy tài nguyên!', HttpStatus.NOT_FOUND)
    }
  }

  validateBranchExpiry(currentShop: any): void {
    if (!currentShop.branches[0].expiryAt || currentShop.branches[0].expiryAt < new Date()) {
      throw new HttpException('Đã hết thời gian sử dụng!', HttpStatus.BAD_REQUEST)
    }
  }

  async deleteAccountSocket(deviceId: string): Promise<void> {
    await this.prisma.accountSocket.delete({
      where: { deviceId }
    })
  }
}
