import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateActivityLogDto, FindManyActivityLogDto } from './dto/activity-log.dto'
import { Prisma } from '@prisma/client'
import { customPaginate, removeDiacritics } from 'helpers'
@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateActivityLogDto,
    options: {
      branchId?: string
      shopId?: string
    },
    accountId: string
  ) {
    if (!['Order', 'OrderDetail', 'Table'].includes(data.modelName)) return
    return this.prisma.activityLog.create({
      data: {
        action: data.action,
        modelName: data.modelName,
        targetId: data.targetId,
        targetName: data.targetName,
        relatedName: data.relatedName,
        relatedModel: data.relatedModel,
        accountId,
        branchId: options.branchId,
        shopId: options.shopId
      }
    })
  }

  async findAll(params: FindManyActivityLogDto, branchId: string) {
    const { from, to, keyword, orderBy, page, perPage } = params

    const keySearch = ['targetName', 'relatedName']

    const where: Prisma.ActivityLogWhereInput = {
      branchId,
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      }),
      ...(from &&
        to && {
          createdAt: {
            gte: new Date(from),
            lte: new Date(to)
          }
        }),
      ...(from &&
        !to && {
          createdAt: {
            gte: new Date(from)
          }
        }),
      ...(!from &&
        to && {
          createdAt: {
            lte: new Date(to)
          }
        })
    }

    return await customPaginate(
      this.prisma.activityLog,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where
      },
      {
        page,
        perPage
      }
    )
  }
}
