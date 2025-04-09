import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { DeleteManyDto } from 'utils/Common.dto'
import { customPaginate, generateCode, removeDiacritics } from 'utils/Helps'
import {
  CreateDiscountCodeDto,
  FindManyDiscountCodeDto,
  CheckAvailableDto
} from './dto/discount-code.dto'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { discountCodeSelect } from 'responses/discountCode.response'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class DiscountCodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateDiscountCodeDto, accountId: string, branchId: string) {
    const discountCodeData = []

    await this.checkAmountValid(data.amount, data.discountIssueId)

    for (let i = 0; i < data.amount; i++) {
      discountCodeData.push({
        code: `${data.prefix || ''}${generateCode('')}${data.suffixes || ''}`,
        discountIssueId: data.discountIssueId,
        branchId,
        createdBy: accountId
      })
    }

    return this.prisma.$transaction(async prisma => {
      await this.activityLogService.create(
        {
          action: ActivityAction.GENERATE_DISCOUNT_CODES,
          modelName: 'DiscountCode',
          targetName: data.amount.toString()
        },
        { branchId, prisma },
        accountId
      )

      return await prisma.discountCode.createMany({
        data: discountCodeData
      })
    })
  }

  async checkAmountValid(amount: number, discountIssueId: string) {
    const [discountIssue, currentAmount] = await Promise.all([
      this.prisma.discountIssue.findUnique({
        where: { id: discountIssueId }
      }),
      this.prisma.discountCode.count({
        where: { discountIssueId }
      })
    ])

    if (discountIssue.isLimit && amount + currentAmount > discountIssue.amount)
      throw new HttpException('Số lượng vượt quá đợt khuyến mãi!', HttpStatus.CONFLICT)
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.discountCode.findMany({
        where: { id: { in: data.ids } }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'DiscountCode'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'DiscountCode',
            targetName: entities.map(item => item.code).join(', ')
          },
          { branchId, prisma },
          accountId
        )
      ])

      return prisma.discountCode.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          branchId
        }
      })
    })
  }

  async findAll(params: FindManyDiscountCodeDto, branchId: string) {
    const { page, perPage, keyword, orderBy, isUsed, discountIssueIds } = params

    const where: Prisma.DiscountCodeWhereInput = {
      branchId,
      ...(keyword && { name: { contains: removeDiacritics(keyword) } }),
      ...(isUsed !== undefined && { isUsed }),
      ...(discountIssueIds && {
        discountIssue: {
          id: { in: discountIssueIds }
        }
      })
    }
    return await customPaginate(
      this.prisma.discountCode,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: discountCodeSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string, branchId: string) {
    return this.prisma.discountCode.findUniqueOrThrow({
      where: {
        id,
        branchId
      },
      select: discountCodeSelect
    })
  }

  async checkAvailable(data: CheckAvailableDto) {
    return await this.prisma.discountCode.findUniqueOrThrow({
      where: {
        branchId_code: {
          branchId: data.branchId,
          code: data.code
        },
        isUsed: false,
        discountIssue: {
          AND: [
            {
              startDate: {
                lte: new Date(new Date().setHours(23, 59, 59, 999))
              }
            },
            {
              OR: [
                {
                  endDate: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                  }
                },
                {
                  endDate: null
                }
              ]
            }
          ]
        }
      }
    })
  }
}
