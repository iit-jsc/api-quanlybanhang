import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { Prisma, PrismaClient } from '@prisma/client'
import { DeleteManyDto } from 'utils/Common.dto'
import { customPaginate, removeDiacritics } from 'utils/Helps'
import { CreateAreaDto, FindManyAreaDto, UpdateAreaDto } from './dto/area.dto'
import { areaSelect } from 'responses/area.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'

@Injectable()
export class AreaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService
  ) {}

  async create(data: CreateAreaDto, accountId: string, branchId: string) {
    const area = await this.prisma.area.create({
      data: {
        name: data.name,
        photoURL: data.photoURL,
        tables: {
          create: {
            name: 'Bàn 01',
            branchId
          }
        },
        branchId,
        createdBy: accountId
      }
    })

    return area
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
    return await this.prisma.area.update({
      where: {
        id,
        branchId: branchId
      },
      data: {
        name: data.name,
        photoURL: data.photoURL,
        updatedBy: accountId
      },
      select: areaSelect
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'Area',
        include: {
          tables: true
        }
      }

      await this.trashService.createMany(dataTrash, prisma)

      return prisma.area.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          branchId
        }
      })
    })
  }
}
