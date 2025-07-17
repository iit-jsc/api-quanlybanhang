import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  CreateProductTypeDto,
  FindManyProductTypeDto,
  UpdateProductTypeDto
} from './dto/product-type.dto'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { customPaginate, generateSlug } from 'helpers'
import { productTypeSelect } from 'responses/product-type.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class ProductTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}
  async create(data: CreateProductTypeDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      // Kiểm tra tên đã tồn tại (không phân biệt chữ hoa thường nhưng phân biệt dấu)
      const allProductTypes = await prisma.productType.findMany({
        where: { branchId },
        select: { name: true }
      })

      const nameExists = allProductTypes.some(
        pt => pt.name.toLowerCase() === data.name.toLowerCase()
      )

      if (nameExists) {
        throw new HttpException(`Tên loại sản phẩm ${data.name} đã tồn tại`, HttpStatus.CONFLICT)
      }

      const productType = await prisma.productType.create({
        data: {
          name: data.name,
          slug: data.slug || generateSlug(data.name),
          description: data.description,
          branchId,
          createdBy: accountId
        },
        select: productTypeSelect
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.CREATE,
          modelName: 'ProductType',
          targetName: productType.name,
          targetId: productType.id
        },
        { branchId },
        accountId
      )

      return productType
    })
  }

  async findAll(params: FindManyProductTypeDto) {
    const { page, perPage, keyword, branchId, orderBy } = params

    const keySearch = ['name', 'slug']

    const where: Prisma.ProductTypeWhereInput = {
      branchId: branchId,
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: keyword }
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
    return this.prisma.$transaction(async prisma => {
      // Kiểm tra tên đã tồn tại (không phân biệt chữ hoa thường nhưng phân biệt dấu), loại trừ record hiện tại
      const allProductTypes = await prisma.productType.findMany({
        where: {
          branchId,
          id: { not: id }
        },
        select: { name: true }
      })

      const nameExists = allProductTypes.some(
        pt => pt.name.toLowerCase() === data.name.toLowerCase()
      )

      if (nameExists) {
        throw new HttpException(`Tên loại sản phẩm ${data.name} đã tồn tại`, HttpStatus.CONFLICT)
      }

      const productType = await prisma.productType.update({
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

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'ProductType',
          targetId: productType.id,
          targetName: productType.name
        },
        { branchId },
        accountId
      )

      return productType
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.productType.findMany({
        where: { id: { in: data.ids } }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'ProductType'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'ProductType',
            targetName: entities.map(item => item.name).join(', ')
          },
          { branchId },
          accountId
        )
      ])

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
