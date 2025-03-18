import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateCustomerDto, FindManyCustomerDto, UpdateCustomerDto } from './dto/customer.dto'
import { Prisma, PrismaClient } from '@prisma/client'
import { DeleteManyDto } from 'utils/Common.dto'
import { removeDiacritics, customPaginate } from 'utils/Helps'
import { customerSelect } from 'responses/customer.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService
  ) {}

  async create(data: CreateCustomerDto, accountId, shopId: string) {
    return await this.prisma.customer.create({
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
  }

  async findAll(params: FindManyCustomerDto, shopId: string) {
    const { page, perPage, keyword, customerTypeIds, from, to, orderBy } = params

    const keySearch = ['name', 'email', 'phone']

    const where: Prisma.CustomerWhereInput = {
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
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
    return await this.prisma.customer.update({
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
  }

  async deleteMany(data: DeleteManyDto, accountId: string, shopId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'Customer'
      }

      await this.trashService.createMany(dataTrash, prisma)

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
