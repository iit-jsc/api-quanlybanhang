import { Injectable } from '@nestjs/common'
import { ActivityAction, Prisma, PrismaClient, VoucherType } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { DeleteManyDto } from 'utils/Common.dto'
import { removeDiacritics, customPaginate, generateCode } from 'utils/Helps'
import {
  CreateVoucherDto,
  FindManyVoucherDto,
  OrderProductDto,
  UpdateVoucherDto
} from './dto/voucher.dto'
import { voucherDetailSelect, voucherSelect } from 'responses/voucher.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class VoucherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateVoucherDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async (prisma: PrismaClient) => {
      const voucher = await prisma.voucher.create({
        data: {
          name: data.name,
          code: data.code || generateCode('VOU'),
          startDate: data.startDate,
          operator: data.operator,
          endDate: data.endDate,
          amount: data.amount,
          maxValue: data.maxValue,
          isActive: data.isActive,
          description: data.description,
          discount: data.discount,
          discountType: data.discountType,
          type: data.type,
          branchId,
          createdBy: accountId,
          ...(data.conditionGroups && {
            conditionGroups: {
              create: data.conditionGroups?.map(conditionGroup => ({
                operator: conditionGroup.operator,
                conditions: {
                  create: conditionGroup.conditions?.map(condition => ({
                    type: condition.type,
                    productId: condition.productId,
                    minQuantity: condition.minQuantity,
                    minCustomer: condition.minCustomer,
                    minOrderTotal: condition.minOrderTotal
                  }))
                }
              }))
            }
          }),
          ...(data.voucherProducts &&
            data.type == VoucherType.PRODUCT && {
              voucherProducts: {
                create: data.voucherProducts?.map(product => ({
                  productId: product.productId,
                  amount: product.amount,
                  type: product.type,
                  limitQuantity: product.limitQuantity,
                  name: product.name,
                  photoURL: product.photoURL,
                  promotionalPrice: product.promotionalPrice
                }))
              }
            })
        },
        select: voucherDetailSelect
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.CREATE,
          modelName: 'Voucher',
          targetName: voucher.name,
          targetId: voucher.id
        },
        { branchId },
        accountId
      )

      return voucher
    })
  }

  async findAll(params: FindManyVoucherDto) {
    const { page, perPage, keyword, branchId, orderBy, types, isActive, endDate } = params

    const where: Prisma.VoucherWhereInput = {
      branchId,
      ...(types && { type: { in: types } }),
      ...(keyword && { name: { contains: removeDiacritics(keyword) } }),
      ...(typeof isActive !== 'undefined' && { isActive }),
      ...(endDate && { endDate: { lte: endDate } })
    }

    return await customPaginate(
      this.prisma.voucher,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: voucherSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string) {
    return this.prisma.voucher.findFirstOrThrow({
      where: {
        id
      },
      select: voucherDetailSelect
    })
  }

  async update(id: string, data: UpdateVoucherDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      const voucher = await prisma.voucher.update({
        data: {
          name: data.name,
          code: data.code,
          startDate: data.startDate,
          endDate: data.endDate,
          maxValue: data.maxValue,
          amount: data.amount,
          isActive: data.isActive,
          description: data.description,
          discount: data.discount,
          discountType: data.discountType,
          type: data.type,
          updatedBy: accountId,
          branchId,
          ...(data.conditionGroups && {
            conditionGroups: {
              deleteMany: {
                voucherId: id
              },
              create: data.conditionGroups?.map(conditionGroup => ({
                operator: conditionGroup.operator,
                conditions: {
                  create: conditionGroup.conditions?.map(condition => ({
                    type: condition.type,
                    productId: condition.productId,
                    minQuantity: condition.minQuantity,
                    minCustomer: condition.minCustomer,
                    minOrderTotal: condition.minOrderTotal
                  }))
                }
              }))
            }
          }),
          ...(data.voucherProducts && {
            voucherProducts: {
              deleteMany: {
                voucherId: id
              },
              create: data.voucherProducts.map(product => ({
                productId: product.productId,
                amount: product.amount,
                limitQuantity: product.limitQuantity,
                name: product.name,
                type: product.type,
                photoURL: product.photoURL,
                promotionalPrice: product.promotionalPrice
              }))
            }
          })
        },
        where: {
          id,
          branchId
        },
        select: voucherDetailSelect
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'Voucher',
          targetId: voucher.id,
          targetName: voucher.name
        },
        { branchId },
        accountId
      )

      return voucher
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.voucher.findMany({
        where: { id: { in: data.ids } },
        include: {
          voucherProducts: true,
          conditionGroups: {
            include: {
              conditions: true
            }
          }
        }
      })

      const dataTrash: CreateManyTrashDto = {
        accountId,
        modelName: 'Voucher',
        entities
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'Voucher',
            targetName: entities.map(item => item.name).join(', ')
          },
          { branchId },
          accountId
        )
      ])

      return prisma.voucher.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          branchId
        }
      })
    })
  }

  aggregateOrderProducts(data: OrderProductDto[]) {
    if (!data && !data?.length) return data

    return Object.values(
      data.reduce((acc, { productId, amount }) => {
        if (!acc[productId]) {
          acc[productId] = { productId, amount: 0 }
        }
        acc[productId].amount += amount
        return acc
      }, {} as OrderProductDto)
    )
  }
}
