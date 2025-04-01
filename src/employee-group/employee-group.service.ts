import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateEmployeeGroupDto, UpdateEmployeeGroupDto } from './dto/employee-group.dto'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { Prisma, PrismaClient } from '@prisma/client'
import { customPaginate, removeDiacritics } from 'utils/Helps'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { employeeGroupSelect } from 'responses/employee-group.response'

@Injectable()
export class EmployeeGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService
  ) {}

  async create(data: CreateEmployeeGroupDto, accountId: string, shopId: string) {
    return await this.prisma.employeeGroup.create({
      data: {
        name: data.name,
        description: data.description,
        shopId,
        createdBy: accountId
      }
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
    return await this.prisma.employeeGroup.update({
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
  }

  async deleteMany(data: DeleteManyDto, accountId: string, shopId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'EmployeeGroup'
      }

      await this.trashService.createMany(dataTrash, prisma)

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
