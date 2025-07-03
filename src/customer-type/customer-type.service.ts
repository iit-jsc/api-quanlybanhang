import { Injectable } from '@nestjs/common'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { customPaginate } from 'utils/Helps'
import { CreateCustomerTypeDto, UpdateCustomerTypeDto } from './dto/customer-type.dto'
import { customerTypeSelect } from 'responses/customer-type.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class CustomerTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateCustomerTypeDto, accountId: string, shopId: string) {
    const customerType = await this.prisma.customerType.create({
      data: {
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discount: data.discount,
        shopId: shopId,
        createdBy: accountId
      }
    })

    await this.activityLogService.create(
      {
        action: ActivityAction.CREATE,
        modelName: 'CustomerType',
        targetName: customerType.name,
        targetId: customerType.id
      },
      { shopId },
      accountId
    )

    return customerType
  }

  async findAll(params: FindManyDto, shopId: string) {
    const { page, perPage, keyword, orderBy } = params
    const where: Prisma.CustomerTypeWhereInput = {
      ...(keyword && { name: { contains: keyword } }),
      shopId
    }

    return await customPaginate(
      this.prisma.customerType,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: customerTypeSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string, shopId: string) {
    return this.prisma.customerType.findUniqueOrThrow({
      where: {
        id,
        shopId
      },
      select: customerTypeSelect
    })
  }

  async update(id: string, data: UpdateCustomerTypeDto, accountId: string, shopId: string) {
    return this.prisma.$transaction(async prisma => {
      const customerType = await prisma.customerType.update({
        where: {
          id,
          shopId
        },
        data: {
          name: data.name,
          description: data.description,
          discountType: data.discountType,
          discount: data.discount,
          updatedBy: accountId
        }
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'CustomerType',
          targetId: customerType.id,
          targetName: customerType.name
        },
        { shopId },
        accountId
      )

      return customerType
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, shopId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.customerType.findMany({
        where: { id: { in: data.ids } }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'CustomerType'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'CustomerType',
            targetName: entities.map(item => item.name).join(', ')
          },
          { shopId },
          accountId
        )
      ])

      return prisma.customerType.deleteMany({
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
