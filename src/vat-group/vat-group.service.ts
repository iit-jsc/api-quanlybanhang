import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateVatGroupDto, UpdateVatGroupDto } from './dto/vat-group.dto'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { customPaginate } from 'utils/Helps'
import { Prisma, PrismaClient } from '@prisma/client'
import { vatGroupSelect } from 'responses/vat-group.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
// import { vatGroupSelect } from 'responses/vat-group.response'

@Injectable()
export class VatGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService
  ) {}

  async create(data: CreateVatGroupDto, accountId: string, branchId: string) {
    return await this.prisma.vATGroup.create({
      data: {
        name: data.name,
        vatRate: data.vatRate,
        branchId: branchId,
        createdBy: accountId
      }
    })
  }

  async findAll(params: FindManyDto, branchId: string) {
    const { page, perPage, keyword, orderBy } = params
    const keySearch = ['name']

    const where: Prisma.VATGroupWhereInput = {
      branchId,
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: keyword }
        }))
      })
    }

    return await customPaginate(
      this.prisma.vATGroup,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: vatGroupSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string, branchId: string) {
    return this.prisma.vATGroup.findUniqueOrThrow({
      where: {
        id,
        branchId
      },
      select: vatGroupSelect
    })
  }

  async update(id: string, data: UpdateVatGroupDto, accountId: string, branchId: string) {
    return this.prisma.vATGroup.update({
      where: { id, branchId },
      data: {
        name: data.name,
        vatRate: data.vatRate,
        updatedBy: accountId
      }
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.vATGroup.findMany({
        where: { id: { in: data.ids } }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'VATGroup'
      }

      await this.trashService.createMany(dataTrash, prisma)

      return prisma.vATGroup.deleteMany({
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
