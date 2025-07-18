import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateCustomerDto, FindManyCustomerDto, UpdateCustomerDto } from './dto/customer.dto'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { DeleteManyDto } from 'utils/Common.dto'
import { customPaginate } from 'utils/Helps'
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
          discountFor: data.discountFor,
          phone: data.phone,
          isOrganize: data.isOrganize,
          address: data.address,
          birthday: data.birthday,
          description: data.description,
          discount: data.discount,
          discountType: data.discountType,
          email: data.email,
          fax: data.fax,
          tax: data.tax,
          sex: data.sex,
          representativeName: data.representativeName,
          representativePhone: data.representativePhone,
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
    const { page, perPage, keyword, customerTypeIds, from, to, orderBy } = params

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
      shopId
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
    return this.prisma.$transaction(async prisma => {
      const customer = await prisma.customer.update({
        where: {
          id,
          shopId
        },
        data: {
          name: data.name,
          discountFor: data.discountFor,
          isOrganize: data.isOrganize,
          phone: data.phone,
          address: data.address,
          birthday: data.birthday,
          description: data.description,
          discount: data.discount,
          discountType: data.discountType,
          email: data.email,
          fax: data.fax,
          tax: data.tax,
          sex: data.sex,
          representativeName: data.representativeName,
          representativePhone: data.representativePhone,
          customerTypeId: data.customerTypeId,
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
    })
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
}
