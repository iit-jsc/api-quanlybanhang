import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateCustomerDto, FindManyCustomerDto, UpdateCustomerDto } from './dto/customer.dto'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { CheckUniqDto, DeleteManyDto } from 'utils/Common.dto'
import { customPaginate, generateCode } from 'utils/Helps'
import { customerSelect } from 'responses/customer.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateCustomerDto, accountId, shopId: string) {
    return this.prisma.$transaction(async prisma => {
      const customer = await prisma.customer.create({
        data: {
          name: data.name,
          code: data.code || generateCode('KH'),
          phone: data.phone,
          organizeName: data.organizeName,
          isOrganize: data.isOrganize,
          address: data.address,
          birthday: data.birthday,
          description: data.description,
          email: data.email,
          tax: data.tax,
          sex: data.sex,
          ...(data.customerTypeId && {
            customerTypeId: data.customerTypeId
          }),
          shopId,
          createdBy: accountId
        }
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.CREATE,
          modelName: 'Customer',
          targetName: customer.name,
          targetId: customer.id
        },
        { shopId },
        accountId
      )

      return customer
    })
  }

  async findAll(params: FindManyCustomerDto, shopId: string) {
    const { page, perPage, keyword, customerTypeIds, from, to, orderBy, isOrganize } = params

    const keySearch = ['name', 'email', 'phone']

    const where: Prisma.CustomerWhereInput = {
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: keyword }
        }))
      }),
      ...(customerTypeIds?.length > 0 && {
        customerType: {
          id: { in: customerTypeIds }
        }
      }),
      ...(from &&
        to && {
          createdAt: {
            gte: from,
            lte: new Date(new Date(to).setHours(23, 59, 59, 999))
          }
        }),
      ...(from &&
        !to && {
          createdAt: {
            gte: from
          }
        }),
      ...(!from &&
        to && {
          createdAt: {
            lte: new Date(new Date(to).setHours(23, 59, 59, 999))
          }
        }),
      shopId,
      isOrganize: isOrganize !== undefined ? isOrganize : undefined
    }

    return await customPaginate(
      this.prisma.customer,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: customerSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string, shopId: string) {
    return this.prisma.customer.findUniqueOrThrow({
      where: {
        id,
        shopId
      },
      select: customerSelect
    })
  }

  async update(id: string, data: UpdateCustomerDto, accountId: string, shopId: string) {
    const customer = await this.prisma.customer.update({
      where: {
        id,
        shopId
      },
      data: {
        name: data.name,
        code: data.code,
        phone: data.phone,
        organizeName: data.organizeName,
        isOrganize: data.isOrganize,
        address: data.address,
        birthday: data.birthday,
        description: data.description,
        email: data.email,
        tax: data.tax,
        sex: data.sex,
        ...(data.customerTypeId && {
          customerTypeId: data.customerTypeId
        }),
        updatedBy: accountId
      }
    })

    await this.activityLogService.create(
      {
        action: ActivityAction.UPDATE,
        modelName: 'Customer',
        targetId: customer.id,
        targetName: customer.name
      },
      { shopId },
      accountId
    )

    return customer
  }

  async deleteMany(data: DeleteManyDto, accountId: string, shopId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.customer.findMany({
        where: { id: { in: data.ids } }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'Customer'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'Customer',
            targetName: entities.map(item => item.name).join(', ')
          },
          { shopId },
          accountId
        )
      ])

      return prisma.customer.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          shopId
        }
      })
    })
  }

  async checkValidField(data: CheckUniqDto, shopId: string) {
    const { field, id, value } = data

    const record = await this.prisma.customer.findFirst({
      where: {
        [field]: value,
        shopId,
        ...(id && { id: { not: id } })
      }
    })

    return record === null
  }

  /**
   * Check if a customer exists by field and value
   * Returns detailed response with exists flag
   */
  async checkExists(data: CheckUniqDto, shopId: string) {
    const { field, value, id } = data

    const record = await this.prisma.customer.findFirst({
      where: {
        [field]: value,
        shopId,
        ...(id && { id: { not: id } })
      },
      select: { id: true, [field]: true }
    })

    return {
      exists: record !== null,
      field,
      value,
      ...(record && { foundRecord: record })
    }
  }
}
