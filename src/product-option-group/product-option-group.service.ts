import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  CreateProductOptionDto,
  CreateProductOptionGroupDto,
  FindManyProductOptionGroupDto,
  UpdateProductOptionGroupDto
} from './dto/product-option-group.dto'
import { Prisma, PrismaClient } from '@prisma/client'
import { removeDiacritics, customPaginate } from 'utils/Helps'
import { productOptionGroupSelect } from 'responses/product-option-group.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'

@Injectable()
export class ProductOptionGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService
  ) {}

  async create(data: CreateProductOptionGroupDto, accountId: string, branchId: string) {
    this.validateValidateProductOptions(data.productOptions)

    return await this.prisma.productOptionGroup.create({
      data: {
        name: data.name,
        productOptions: {
          create: data.productOptions.map(option => ({
            name: option.name,
            price: option.price,
            isDefault: option.isDefault,
            isAppliedToAll: option.isAppliedToAll,
            photoURL: option.photoURL,
            products: {
              connect: option.productIds?.map(id => ({ id }))
            },
            excludedProducts: {
              connect: option.excludedProductIds?.map(id => ({ id }))
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
  }

  async findAll(params: FindManyProductOptionGroupDto, branchId: string) {
    const { page, perPage, keyword, orderBy, productTypeIds, productId } = params

    const where: Prisma.ProductOptionGroupWhereInput = {
      ...(keyword && { name: { contains: removeDiacritics(keyword) } }),
      ...(productTypeIds && {
        productTypes: {
          some: { id: { in: productTypeIds } }
        }
      }),
      ...(productId && {
        OR: [
          {
            productOptions: {
              some: {
                isAppliedToAll: true
              }
            }
          },
          {
            productOptions: {
              some: {
                products: {
                  some: { id: productId }
                }
              }
            }
          }
        ]
      }),
      branchId
    }

    return await customPaginate(
      this.prisma.productOptionGroup,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: productOptionGroupSelect(productId)
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

      return await prisma.productOptionGroup.update({
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
                isAppliedToAll: option.isAppliedToAll,
                photoURL: option.photoURL,
                products: {
                  connect: option.productIds?.map(id => ({ id }))
                },
                excludedProducts: {
                  connect: option.excludedProductIds?.map(id => ({ id }))
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
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'ProductOptionGroup',
        include: {
          productOptions: true
        }
      }

      await this.trashService.createMany(dataTrash, prisma)

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

  validateValidateProductOptions(productOptions: CreateProductOptionDto[]) {
    this.validateDefaultProductOptions(productOptions)

    for (let i = 0; i < productOptions.length; i++) {
      const option = productOptions[i]

      if (option.isAppliedToAll && option.productIds.length > 0) {
        throw new HttpException(
          'Danh sách sản phẩm phải rỗng nếu như chọn áp dụng cho tất cả!',
          HttpStatus.CONFLICT
        )
      }

      for (let j = 0; j < option.productIds.length; j++) {
        const productId = option.productIds[j]
        if (option.excludedProductIds.includes(productId)) {
          throw new HttpException(
            'Sản phẩm không thể xuất hiện đồng thời cả 2 danh sách!',
            HttpStatus.CONFLICT
          )
        }
      }
    }
  }
}
