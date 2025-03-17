import { Injectable } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { customPaginate, removeDiacritics } from 'utils/Helps'
import { CreateCustomerTypeDto, UpdateCustomerTypeDto } from './dto/create-customer-type'
import { customerTypeSelect } from 'responses/customer-type.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'

@Injectable()
export class CustomerTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService
  ) {}

  async create(data: CreateCustomerTypeDto, accountId: string, shopId: string) {
    return await this.prisma.customerType.create({
      data: {
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discount: data.discount,
        shopId: shopId,
        createdBy: accountId
      }
    })
  }

  async findAll(params: FindManyDto, shopId: string) {
    const { page, perPage, keyword, orderBy } = params
    const where: Prisma.CustomerTypeWhereInput = {
      ...(keyword && { name: { contains: removeDiacritics(keyword) } }),
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
    return await this.prisma.customerType.update({
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
  }

  async deleteMany(data: DeleteManyDto, accountId: string, shopId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'CustomerType'
      }

      await this.trashService.createMany(dataTrash, prisma)

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
