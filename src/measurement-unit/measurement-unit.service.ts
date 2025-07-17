import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateMeasurementUnitDto, UpdateMeasurementUnitDto } from './dto/measurement-unit.dto'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { removeDiacritics, customPaginate } from 'helpers'
import { measurementUnitSelect } from 'responses/measurement-unit.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class MeasurementUnitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateMeasurementUnitDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      const unit = await prisma.measurementUnit.create({
        data: {
          name: data.name,
          code: data.code,
          createdBy: accountId,
          branchId
        }
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.CREATE,
          modelName: 'MeasurementUnit',
          targetName: unit.name,
          targetId: unit.id
        },
        { branchId },
        accountId
      )

      return unit
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
    return this.prisma.$transaction(async prisma => {
      const measurementUnit = await prisma.measurementUnit.update({
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

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'MeasurementUnit',
          targetId: measurementUnit.id,
          targetName: measurementUnit.name
        },
        { branchId },
        accountId
      )

      return measurementUnit
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.measurementUnit.findMany({
        where: { id: { in: data.ids } }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'MeasurementUnit'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'MeasurementUnit',
            targetName: entities.map(item => item.name).join(', ')
          },
          { branchId },
          accountId
        )
      ])

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
