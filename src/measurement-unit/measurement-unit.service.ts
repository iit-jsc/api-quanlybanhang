import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateMeasurementUnitDto, UpdateMeasurementUnitDto } from './dto/measurement-unit.dto'
import { Prisma, PrismaClient } from '@prisma/client'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { removeDiacritics, customPaginate } from 'utils/Helps'
import { measurementUnitSelect } from 'responses/measurement-unit.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'

@Injectable()
export class MeasurementUnitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService
  ) {}

  async create(data: CreateMeasurementUnitDto, accountId: string, branchId: string) {
    return await this.prisma.measurementUnit.create({
      data: {
        name: data.name,
        code: data.code,
        createdBy: accountId,
        branchId
      }
    })
  }

  async findAll(params: FindManyDto, branchId: string) {
    const { page, perPage, keyword, orderBy } = params
    const keySearch = ['name', 'code']

    const where: Prisma.MeasurementUnitWhereInput = {
      branchId,
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      })
    }

    return await customPaginate(
      this.prisma.measurementUnit,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: measurementUnitSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string, branchId: string) {
    return this.prisma.measurementUnit.findUniqueOrThrow({
      where: {
        id,
        branchId
      },
      select: measurementUnitSelect
    })
  }

  async update(id: string, data: UpdateMeasurementUnitDto, accountId: string, branchId: string) {
    return await this.prisma.measurementUnit.update({
      data: {
        name: data.name,
        code: data.code,
        updatedBy: accountId
      },
      where: {
        id,
        branchId
      }
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'MeasurementUnit'
      }

      await this.trashService.createMany(dataTrash, prisma)

      return prisma.measurementUnit.deleteMany({
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
