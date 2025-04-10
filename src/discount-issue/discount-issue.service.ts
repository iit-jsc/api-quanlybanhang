import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  CreateDiscountIssueDto,
  FindManyDiscountIssueDto,
  findUniqByDiscountCodeDto,
  UpdateDiscountIssueDto
} from './dto/discount-issue.dto'
import { customPaginate, generateCode, removeDiacritics } from 'utils/Helps'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { DeleteManyDto } from 'utils/Common.dto'
import { discountIssueSelect } from 'responses/discountIssue.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class DiscountIssueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateDiscountIssueDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      const discountIssue = await prisma.discountIssue.create({
        data: {
          name: data.name,
          code: generateCode('KM'),
          discountType: data.discountType,
          discount: data.discount,
          startDate: data.startDate,
          endDate: data.endDate,
          description: data.description,
          amount: data.amount,
          isLimit: data.isLimit,
          minOrderTotal: data.minOrderTotal,
          maxValue: data.maxValue,
          branchId: branchId,
          createdBy: accountId
        },
        select: discountIssueSelect
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.CREATE,
          modelName: 'DiscountIssue',
          targetName: discountIssue.name,
          targetId: discountIssue.id
        },
        { branchId },
        accountId
      )

      return discountIssue
    })
  }

  async update(id: string, data: UpdateDiscountIssueDto, accountId: string, branchId: string) {
    if (data.endDate && data.startDate && data.endDate < data.startDate)
      throw new HttpException('Ngày kết thúc không hợp lệ!', HttpStatus.CONFLICT)

    return this.prisma.$transaction(async prisma => {
      const discountIssue = await prisma.discountIssue.update({
        data: {
          name: data.name,
          code: data.code,
          discountType: data.discountType,
          discount: data.discount,
          startDate: data.startDate,
          endDate: data.endDate,
          description: data.description,
          amount: data.amount,
          isLimit: data.isLimit,
          minOrderTotal: data.minOrderTotal,
          maxValue: data.maxValue,
          updatedBy: accountId,
          branchId
        },
        where: { id, branchId },
        select: discountIssueSelect
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'DiscountIssue',
          targetId: discountIssue.id,
          targetName: discountIssue.name
        },
        { branchId },
        accountId
      )

      return discountIssue
    })
  }

  async findAll(params: FindManyDiscountIssueDto, branchId: string) {
    const { page, perPage, keyword, orderBy, totalOrder } = params

    const where: Prisma.DiscountIssueWhereInput = {
      ...(keyword && { name: { contains: removeDiacritics(keyword) } }),
      ...(totalOrder && {
        minOrderTotal: {
          lte: totalOrder
        }
      }),
      branchId
    }

    return await customPaginate(
      this.prisma.discountIssue,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: discountIssueSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string, branchId: string) {
    return this.prisma.discountIssue.findUniqueOrThrow({
      where: {
        id,
        branchId
      },
      select: discountIssueSelect
    })
  }

  async findByDiscountCode(data: findUniqByDiscountCodeDto) {
    const { branchId, code } = data

    const discountIssue = await this.prisma.discountIssue.findFirst({
      where: {
        branchId: branchId,
        startDate: {
          lte: new Date(new Date().setHours(23, 59, 59, 999))
        },
        AND: [
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
        ],
        discountCodes: {
          some: {
            code: code,
            isUsed: false
          }
        }
      }
    })

    if (!discountIssue) throw new HttpException('Không tìm thấy khuyến mãi!', HttpStatus.NOT_FOUND)

    return discountIssue
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.discountIssue.findMany({
        where: { id: { in: data.ids } },
        include: {
          discountCodes: true
        }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'DiscountIssue'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'DiscountIssue',
            targetName: entities.map(item => item.name).join(', ')
          },
          { branchId },
          accountId
        )
      ])

      return prisma.discountIssue.deleteMany({
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
