import { Injectable } from '@nestjs/common'
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class BaseReportService {
  constructor(protected readonly prisma: PrismaService) {}
  /**
   * Build date filter for createdAt field - generic version
   */
  buildCreatedAtFilter(from?: Date, to?: Date): { createdAt?: { gte?: Date; lte?: Date } } {
    const where: { createdAt?: { gte?: Date; lte?: Date } } = {}

    if (from && to) {
      where.createdAt = { gte: from, lte: to }
    } else if (from && !to) {
      where.createdAt = { gte: from }
    } else if (!from && to) {
      where.createdAt = { lte: to }
    }

    return where
  }
  /**
   * Get common order filter conditions
   */
  getSuccessOrderFilter(
    branchId: string,
    dateFilter: Prisma.OrderWhereInput = {}
  ): Prisma.OrderWhereInput {
    return {
      branchId,
      paymentStatus: PaymentStatus.SUCCESS,
      status: { not: OrderStatus.CANCELLED },
      isDraft: false,
      ...dateFilter
    }
  }

  /**
   * Get payment method mapping for categorization
   */
  async getPaymentMethodMap(
    records: Array<{ paymentMethodId: string }>
  ): Promise<Map<string, string>> {
    const paymentMethodIds = [...new Set(records.map(r => r.paymentMethodId).filter(Boolean))]

    if (paymentMethodIds.length === 0) {
      return new Map()
    }

    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: { id: { in: paymentMethodIds } },
      select: { id: true, type: true }
    })

    return new Map(paymentMethods.map(pm => [pm.id, pm.type]))
  }

  /**
   * Categorize amount by payment method type
   */
  categorizeByPaymentType(
    paymentMethodId: string | null,
    paymentMethodMap: Map<string, string>
  ): 'CASH' | 'BANKING' | 'VNPAY' {
    const paymentType = paymentMethodId ? paymentMethodMap.get(paymentMethodId) : 'CASH'

    switch (paymentType) {
      case 'BANKING':
        return 'BANKING'
      case 'VNPAY':
        return 'VNPAY'
      default:
        return 'CASH'
    }
  }
}
