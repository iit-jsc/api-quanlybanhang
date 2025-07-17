import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateProductDto, FindManyProductDto, UpdateProductDto } from './dto/product.dto'
import { customPaginate, generateCode, generateSlug } from 'utils/Helps'
import { productSelect } from 'responses/product.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateProductDto, accountId: string, branchId: string) {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug || generateSlug(data.name),
        code: data.code ?? generateCode('SP'),
        vatGroupId: data.vatGroupId,
        price: data.price,
        thumbnail: data.thumbnail,
        oldPrice: data.oldPrice,
        status: data.status,
        photoURLs: data.photoURLs,
        productTypeId: data.productTypeId,
        unitId: data.unitId,
        hasVat: data.hasVat,
        branchId,
        createdBy: accountId
      },
      select: productSelect
    })

    await this.activityLogService.create(
      {
        action: ActivityAction.CREATE,
        modelName: 'Product',
        targetName: product.name,
        targetId: product.id
      },
      { branchId },
      accountId
    )

    return product
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
          [key]: { contains: keyword }
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
    const product = await this.prisma.product.update({
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
        hasVat: data.hasVat,
        thumbnail: data.thumbnail,
        oldPrice: data.oldPrice,
        status: data.status,
        photoURLs: data.photoURLs,
        productTypeId: data.productTypeId,
        unitId: data.unitId,
        vatGroupId: data.vatGroupId,
        branchId,
        updatedBy: accountId
      },
      select: productSelect
    })

    await this.activityLogService.create(
      {
        action: ActivityAction.UPDATE,
        modelName: 'Product',
        targetId: product.id,
        targetName: product.name
      },
      { branchId },
      accountId
    )

    return product
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.product.findMany({
        where: { id: { in: data.ids } }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'Product'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'Product',
            targetName: entities.map(item => item.name).join(', ')
          },
          { branchId },
          accountId
        )
      ])

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
