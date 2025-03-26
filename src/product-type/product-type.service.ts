import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  CreateProductTypeDto,
  FindManyProductTypeDto,
  UpdateProductTypeDto
} from './dto/product-type.dto'
import { Prisma, PrismaClient } from '@prisma/client'
import { removeDiacritics, customPaginate, generateSlug } from 'utils/Helps'
import { productTypeSelect } from 'responses/product-type.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'

@Injectable()
export class ProductTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService
  ) {}

  async create(data: CreateProductTypeDto, accountId: string, branchId: string) {
    return await this.prisma.productType.create({
      data: {
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        description: data.description,
        branchId,
        createdBy: accountId
      },
      select: productTypeSelect
    })
  }

  async findAll(params: FindManyProductTypeDto) {
    const { page, perPage, keyword, branchId, orderBy } = params

    const keySearch = ['name', 'slug']

    const where: Prisma.ProductTypeWhereInput = {
      branchId: branchId,
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      })
    }

    return await customPaginate(
      this.prisma.productType,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: productTypeSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(where: Prisma.ProductTypeWhereInput) {
    return this.prisma.productType.findFirst({
      where,
      select: productTypeSelect
    })
  }

  async update(id: string, data: UpdateProductTypeDto, accountId: string, branchId: string) {
    return await this.prisma.productType.update({
      where: {
        id,
        branchId
      },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        updatedBy: accountId
      },
      select: productTypeSelect
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'ProductType'
      }

      await this.trashService.createMany(dataTrash, prisma)

      return prisma.productType.deleteMany({
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
