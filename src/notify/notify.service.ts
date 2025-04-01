import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateNotifyDto } from './dto/notify.dto'
import { FindManyDto } from 'utils/Common.dto'
import { Prisma } from '@prisma/client'
import { customPaginate } from 'utils/Helps'
import { notifySelect } from 'responses/notify.response'

@Injectable()
export class NotifyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotifyDto, accountId?: string) {
    const accounts = await this.prisma.account.findMany({
      where: {
        branches: {
          some: {
            id: data.branchId
          }
        },
        id: {
          not: accountId
        }
      },
      select: {
        id: true
      }
    })
    return this.prisma.notify.create({
      data: {
        type: data.type,
        orderId: data.orderId,
        customerRequestId: data.customerRequestId,
        tableId: data.tableId,
        accounts: {
          connect: accounts.map(account => ({ id: account.id }))
        }
      }
    })
  }

  async read(id: string, accountId: string) {
    return this.prisma.notify.update({
      where: {
        id,
        accounts: {
          some: {
            id: accountId
          }
        }
      },
      data: {
        isRead: true
      }
    })
  }

  async readAll(accountId: string) {
    return this.prisma.notify.updateMany({
      where: {
        accounts: {
          some: {
            id: accountId
          }
        }
      },
      data: {
        isRead: true
      }
    })
  }

  async findAll(params: FindManyDto, accountId: string) {
    const { page, perPage, orderBy } = params
    const where: Prisma.NotifyWhereInput = {
      accounts: {
        some: {
          id: accountId
        }
      }
    }

    return await customPaginate(
      this.prisma.notify,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: notifySelect
      },
      {
        page,
        perPage
      }
    )
  }
}
