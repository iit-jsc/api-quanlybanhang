import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateEmployeeGroupDto, UpdateEmployeeGroupDto } from './dto/employee-group.dto'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { customPaginate, removeDiacritics } from 'utils/Helps'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { employeeGroupSelect } from 'responses/employee-group.response'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class EmployeeGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateEmployeeGroupDto, accountId: string, shopId: string) {
    return this.prisma.$transaction(async prisma => {
      const employeeGroup = await prisma.employeeGroup.create({
        data: {
          name: data.name,
          description: data.description,
          shopId,
          createdBy: accountId
        }
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.CREATE,
          modelName: 'EmployeeGroup',
          targetName: employeeGroup.name,
          targetId: employeeGroup.id
        },
        { shopId },
        accountId
      )

      return employeeGroup
    })
  }

  async findAll(params: FindManyDto, shopId: string) {
    const { page, perPage, keyword, orderBy } = params

    const keySearch = ['name']

    const where: Prisma.EmployeeGroupWhereInput = {
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      }),
      shopId
    }

    return await customPaginate(
      this.prisma.employeeGroup,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: employeeGroupSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string, shopId: string) {
    return this.prisma.employeeGroup.findUniqueOrThrow({
      where: {
        id,
        shopId
      },
      select: employeeGroupSelect
    })
  }

  async update(id: string, data: UpdateEmployeeGroupDto, accountId: string, shopId: string) {
    return this.prisma.$transaction(async prisma => {
      const employeeGroup = await prisma.employeeGroup.update({
        data: {
          name: data.name,
          description: data.description,
          updatedBy: accountId
        },
        where: {
          id,
          shopId
        }
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'EmployeeGroup',
          targetId: employeeGroup.id,
          targetName: employeeGroup.name
        },
        { shopId },
        accountId
      )

      return employeeGroup
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, shopId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.employeeGroup.findMany({
        where: { id: { in: data.ids } }
      })

      const dataTrash: CreateManyTrashDto = {
        accountId,
        modelName: 'EmployeeGroup',
        entities
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'EmployeeGroup',
            targetName: entities.map(item => item.name).join(', ')
          },
          { shopId },
          accountId
        )
      ])

      return prisma.employeeGroup.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          shopId
        }
      })
    })
  }
}
