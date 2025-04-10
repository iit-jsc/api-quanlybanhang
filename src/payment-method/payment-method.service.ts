import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  CreatePaymentMethodDto,
  FindManyPaymentMethodDto,
  UpdatePaymentMethodDto
} from './dto/payment-method.dto'
import { ActivityAction, Prisma } from '@prisma/client'
import { removeDiacritics, customPaginate } from 'utils/Helps'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class PaymentMethodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreatePaymentMethodDto, accountId: string, branchId: string) {
    return this.prisma.paymentMethod.create({
      data: {
        active: data.active,
        bankCode: data.bankCode,
        bankName: data.bankName,
        photoURL: data.photoURL,
        representative: data.representative,
        type: data.type,
        createdBy: accountId,
        branchId
      }
    })
  }

  async update(id: string, data: UpdatePaymentMethodDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      const paymentMethod = await prisma.paymentMethod.update({
        where: {
          id,
          branchId
        },
        data: {
          active: data.active,
          bankCode: data.bankCode,
          bankName: data.bankName,
          photoURL: data.photoURL,
          representative: data.representative,
          type: data.type,
          updatedBy: accountId
        }
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE_PAYMENT_METHOD,
          modelName: 'PaymentMethod',
          targetId: paymentMethod.id,
          targetName: paymentMethod.type
        },
        { branchId },
        accountId
      )

      return paymentMethod
    })
  }
  async findUniq(id: string, branchId: string) {
    return this.prisma.paymentMethod.findUniqueOrThrow({
      where: {
        id,
        branchId
      }
    })
  }

  async findAll(params: FindManyPaymentMethodDto, branchId: string) {
    const { page, perPage, keyword, orderBy, active } = params
    const keySearch = ['bankName', 'bankCode', 'representative', 'type']

    const where: Prisma.PaymentMethodWhereInput = {
      ...(typeof active !== 'undefined' && { active }),
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      }),
      branchId
    }

    return await customPaginate(
      this.prisma.paymentMethod,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where
      },
      {
        page,
        perPage
      }
    )
  }
}
