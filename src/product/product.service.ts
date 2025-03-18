import { Prisma, PrismaClient } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateProductDto, FindManyProductDto, UpdateProductDto } from './dto/product.dto'
import { customPaginate, generateCode, removeDiacritics } from 'utils/Helps'
import { productSelect } from 'responses/product.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService
  ) {}

  async create(data: CreateProductDto, accountId: string, branchId: string) {
    return await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
        code: data.code ?? generateCode('SP'),
        price: data.price,
        thumbnail: data.thumbnail,
        oldPrice: data.oldPrice,
        status: data.status,
        photoURLs: data.photoURLs,
        productTypeId: data.productTypeId,
        unitId: data.unitId,
        branchId,
        createdBy: accountId
      },
      select: productSelect
    })
  }

  async findAll(params: FindManyProductDto) {
    const {
      page,
      perPage,
      keyword,
      productTypeIds,
      measurementUnitIds,
      statuses,
      branchId,
      orderBy
    } = params

    const keySearch = ['name', 'code', 'slug']

    const where: Prisma.ProductWhereInput = {
      branchId,
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      }),
      ...(productTypeIds?.length && {
        productType: {
          id: { in: productTypeIds }
        }
      }),
      ...(measurementUnitIds?.length && {
        measurementUnit: {
          id: { in: measurementUnitIds }
        }
      }),
      ...(statuses && { status: { in: statuses } })
    }

    return await customPaginate(
      this.prisma.product,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: productSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(where: Prisma.ProductWhereInput) {
    return this.prisma.product.findFirst({
      where,
      select: productSelect
    })
  }

  async update(id: string, data: UpdateProductDto, accountId: string, branchId: string) {
    return await this.prisma.product.update({
      where: {
        id,
        branchId
      },
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
        code: data.code,
        price: data.price,
        thumbnail: data.thumbnail,
        oldPrice: data.oldPrice,
        status: data.status,
        photoURLs: data.photoURLs,
        productTypeId: data.productTypeId,
        unitId: data.unitId,
        branchId,
        updatedBy: accountId
      },
      select: productSelect
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'Product'
      }

      await this.trashService.createMany(dataTrash, prisma)

      return prisma.product.deleteMany({
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
