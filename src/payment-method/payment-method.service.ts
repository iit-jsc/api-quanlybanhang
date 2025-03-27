import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  CreatePaymentMethodDto,
  FindManyPaymentMethodDto,
  UpdatePaymentMethodDto
} from './dto/payment-method.dto'
import { Prisma } from '@prisma/client'
import { removeDiacritics, customPaginate } from 'utils/Helps'

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prisma: PrismaService) {}
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
    return await this.prisma.paymentMethod.update({
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
