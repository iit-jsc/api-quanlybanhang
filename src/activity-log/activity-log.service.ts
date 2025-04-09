import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateActivityLogDto, FindManyActivityLogDto } from './dto/activity-log.dto'
import { Prisma, PrismaClient } from '@prisma/client'
import { customPaginate, removeDiacritics } from 'utils/Helps'
@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateActivityLogDto,
    options: {
      branchId?: string
      shopId?: string
      prisma?: PrismaClient | Prisma.TransactionClient
    },
    accountId: string
  ) {
    const prisma = options.prisma ?? this.prisma

    return prisma.activityLog.create({
      data: {
        action: data.action,
        modelName: data.modelName,
        targetId: data.targetId,
        targetName: data.targetName,
        relatedName: data.relatedName,
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
