import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { DeleteManyDto } from 'utils/Common.dto'
import { customPaginate, removeDiacritics } from 'utils/Helps'
import { CreateAreaDto, FindManyAreaDto, UpdateAreaDto } from './dto/area.dto'
import { areaSelect } from 'responses/area.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class AreaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateAreaDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      const area = await prisma.area.create({
        data: {
          name: data.name,
          photoURL: data.photoURL,
          branchId,
          createdBy: accountId
        }
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.CREATE,
          modelName: 'Area',
          targetName: area.name,
          targetId: area.id
        },
        { branchId },
        accountId
      )

      return area
    })
  }

  async findAll(params: FindManyAreaDto, branchId: string) {
    const { page, perPage, keyword, orderBy, areaIds } = params

    const keySearch = ['name']

    const where: Prisma.AreaWhereInput = {
      ...(areaIds && {
        id: {
          in: areaIds
        }
      }),
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      }),
      branchId
    }

    return await customPaginate(
      this.prisma.area,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: areaSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string, branchId: string) {
    return this.prisma.area.findUniqueOrThrow({
      where: {
        id,
        branchId
      },
      select: areaSelect
    })
  }

  async update(id: string, data: UpdateAreaDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      const area = await prisma.area.update({
        where: {
          id,
          branchId
        },
        data: {
          name: data.name,
          photoURL: data.photoURL,
          updatedBy: accountId
        },
        select: areaSelect
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'Area',
          targetId: area.id,
          targetName: area.name
        },
        { branchId },
        accountId
      )

      return area
    })
  }
  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async (prisma: PrismaClient) => {
      // Kiểm tra xem có orderDetail nào đang sử dụng bàn thuộc các khu vực này không
      const orderDetailsUsingTables = await prisma.orderDetail.findMany({
        where: {
          table: {
            areaId: { in: data.ids }
          }
        },
        select: {
          tableId: true,
          table: {
            select: {
              name: true,
              area: {
                select: { name: true }
              }
            }
          }
        }
      })

      if (orderDetailsUsingTables.length > 0) {
        const areaNames = [
          ...new Set(orderDetailsUsingTables.map(od => od.table?.area?.name))
        ].filter(Boolean)
        throw new BadRequestException(
          `Không thể xóa ${areaNames.join(', ')} vì khu vực này có bàn đang sử dụng`
        )
      }

      const entities = await prisma.area.findMany({
        where: { id: { in: data.ids } },
        include: {
          tables: true
        }
      })

      const dataTrash: CreateManyTrashDto = {
        accountId,
        modelName: 'Area',
        entities
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'Area',
            targetName: entities.map(item => item.name).join(', ')
          },
          { branchId },
          accountId
        )
      ])

      return prisma.area.deleteMany({
        where: {
          id: { in: data.ids },
          branchId
        }
      })
    })
  }
}
