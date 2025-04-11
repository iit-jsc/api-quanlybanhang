import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateNotifyDto } from './dto/notify.dto'
import { FindManyDto } from 'utils/Common.dto'
import { Prisma } from '@prisma/client'
import { customPaginate } from 'utils/Helps'
import { notifySelect } from 'responses/notify.response'
import { NotifyGateway } from 'src/gateway/notify.gateway'

@Injectable()
export class NotifyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifyGateway: NotifyGateway
  ) {}

  async create(data: CreateNotifyDto) {
    await this.notifyGateway.handleSendNotify(data)
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
