import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  CreateProductOptionDto,
  CreateProductOptionGroupDto,
  FindManyProductOptionGroupDto,
  UpdateProductOptionGroupDto
} from './dto/product-option-group.dto'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { removeDiacritics, customPaginate } from 'helpers'
import { productOptionGroupSelect } from 'responses/product-option-group.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class ProductOptionGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateProductOptionGroupDto, accountId: string, branchId: string) {
    this.validateDefaultProductOptions(data.productOptions)

    return this.prisma.$transaction(async prisma => {
      const productOptionGroup = await prisma.productOptionGroup.create({
        data: {
          name: data.name,
          productOptions: {
            create: data.productOptions.map(option => ({
              name: option.name,
              price: option.price,
              isDefault: option.isDefault,
              type: option.type,
              photoURL: option.photoURL,
              products: {
                connect: option.productIds?.map(id => ({ id }))
              }
            }))
          },
          isMultiple: data.isMultiple,
          isRequired: data.isRequired,
          createdBy: accountId,
          branchId
        },
        select: productOptionGroupSelect()
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.CREATE,
          modelName: 'ProductOptionGroup',
          targetName: productOptionGroup.name,
          targetId: productOptionGroup.id
        },
        { branchId },
        accountId
      )

      return productOptionGroup
    })
  }

  async findAll(params: FindManyProductOptionGroupDto, branchId: string) {
    const { page, perPage, keyword, orderBy, productTypeIds } = params

    const where: Prisma.ProductOptionGroupWhereInput = {
      ...(keyword && { name: { contains: removeDiacritics(keyword) } }),
      ...(productTypeIds && {
        productTypes: {
          some: { id: { in: productTypeIds } }
        }
      }),
      branchId
    }

    return await customPaginate(
      this.prisma.productOptionGroup,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: productOptionGroupSelect()
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string) {
    return this.prisma.productOptionGroup.findUniqueOrThrow({
      where: {
        id
      },
      select: productOptionGroupSelect()
    })
  }

  async update(id: string, data: UpdateProductOptionGroupDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      if (data.productOptions)
        await prisma.productOption.deleteMany({ where: { productOptionGroupId: id } })

      const productOptionGroup = await prisma.productOptionGroup.update({
        data: {
          name: data.name,
          isMultiple: data.isMultiple,
          isRequired: data.isRequired,
          ...(data.productOptions && {
            productOptions: {
              create: data.productOptions.map(option => ({
                name: option.name,
                price: option.price,
                isDefault: option.isDefault,
                type: option.type,
                photoURL: option.photoURL,
                products: {
                  connect: option.productIds?.map(id => ({ id }))
                }
              }))
            }
          }),
          updatedBy: accountId
        },
        where: {
          id,
          branchId
        },
        select: productOptionGroupSelect()
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'ProductOptionGroup',
          targetId: productOptionGroup.id,
          targetName: productOptionGroup.name
        },
        { branchId },
        accountId
      )
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.productOptionGroup.findMany({
        where: { id: { in: data.ids } },
        include: {
          productOptions: true
        }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'ProductOptionGroup'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'ProductOptionGroup',
            targetName: entities.map(item => item.name).join(', ')
          },
          { branchId },
          accountId
        )
      ])

      return prisma.productOptionGroup.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          branchId
        }
      })
    })
  }
  validateDefaultProductOptions(data: CreateProductOptionDto[]) {
    const defaultCount = data.filter(option => option.isDefault === true).length

    if (defaultCount > 1)
      throw new HttpException('Chỉ có duy nhất dữ liệu là mặc định!', HttpStatus.CONFLICT)
  }
}
