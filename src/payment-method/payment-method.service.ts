import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { FindManyPaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-method.dto'
import { ActivityAction, PaymentMethodType, Prisma } from '@prisma/client'
import { removeDiacritics, customPaginate } from 'utils/Helps'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { paymentMethodSelect } from 'responses/payment-method.response'

@Injectable()
export class PaymentMethodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService
  ) {}

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
        },
        select: paymentMethodSelect
      })

      if (paymentMethod.type === PaymentMethodType.VNPAY) {
        const vnpayMerchant = await prisma.vNPayMerchant.findUnique({
          where: { branchId }
        })

        if (!vnpayMerchant) {
          throw new HttpException(
            'Vui lòng liên hệ hỗ trợ để thiết lập VNPAY Merchant trước khi sử dụng phương thức này',
            HttpStatus.UNPROCESSABLE_ENTITY
          )
        }
      }

      if (paymentMethod.type === PaymentMethodType.CASH)
        throw new HttpException('Không thể cập nhật phương thức này!', HttpStatus.BAD_REQUEST)

      if (paymentMethod.type === PaymentMethodType.BANKING) {
        const missingFields = []

        if (!paymentMethod.bankName) {
          missingFields.push('tên ngân hàng')
        }
        if (!paymentMethod.bankCode) {
          missingFields.push('mã ngân hàng')
        }

        if (missingFields.length > 0) {
          throw new HttpException(
            `Vui lòng cung cấp ${missingFields.join(' và ')}!`,
            HttpStatus.BAD_REQUEST
          )
        }
      }

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
      },
      select: paymentMethodSelect
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
        where,
        select: paymentMethodSelect
      },
      {
        page,
        perPage
      }
    )
  }
}
