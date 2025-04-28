import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ReportProductDto, ReportRevenueDto } from './dto/report.dto'
import { endOfDay, startOfDay } from 'utils/Helps'
import { Prisma } from '@prisma/client'
import { productShortSelect } from 'responses/product.response'
@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async reportRevenue(params: ReportRevenueDto, branchId: string) {
    const { from, to, type } = params

    // Build where clause
    const where: Prisma.OrderWhereInput = {
      branchId,
      isPaid: true // Only include paid orders
    }

    if (from && to) {
      where.createdAt = {
        gte: startOfDay(new Date(from)),
        lte: endOfDay(new Date(to))
      }
    } else if (from) {
      where.createdAt = {
        gte: startOfDay(new Date(from))
      }
    } else if (to) {
      where.createdAt = {
        lte: endOfDay(new Date(to))
      }
    }

    // Perform groupBy query
    const revenue = await this.prisma.order.groupBy({
      by: ['createdAt'],
      where,
      _sum: {
        orderTotal: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Post-process to group by day, month, or year
    const groupedRevenue = revenue.reduce(
      (acc, item) => {
        const date = new Date(item.createdAt)
        let key: string

        if (type === 'month') {
          key = `${date.getFullYear()}-${date.getMonth() + 1}` // e.g., "2025-4"
        } else if (type === 'year') {
          key = `${date.getFullYear()}` // e.g., "2025"
        } else {
          // Default to day
          key = date.toISOString().split('T')[0] // e.g., "2025-04-28"
        }

        if (!acc[key]) {
          acc[key] = { time: key, totalRevenue: 0 }
        }
        acc[key].totalRevenue += item._sum.orderTotal || 0

        return acc
      },
      {} as Record<string, { time: string; totalRevenue: number }>
    )

    // Convert to array and sort by time
    return {
      data: Object.values(groupedRevenue).sort((a, b) => a.time.localeCompare(b.time))
    }
  }

  async reportProduct(params: ReportProductDto, branchId: string) {
    const { from, to } = params

    const where: Prisma.OrderDetailWhereInput = {}

    if (from && to) {
      where.createdAt = {
        gte: startOfDay(new Date(from)),
        lte: endOfDay(new Date(to))
      }
    } else if (from && !to) {
      where.createdAt = {
        gte: startOfDay(new Date(from))
      }
    } else if (!from && to) {
      where.createdAt = {
        lte: endOfDay(new Date(to))
      }
    }

    const products = await this.prisma.orderDetail.groupBy({
      by: ['productOriginId'],
      where: {
        branchId,
        ...where
      },
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 10
    })

    const productIds = products.map(p => p.productOriginId).filter(id => id)

    if (productIds.length === 0) {
      return []
    }

    const productInfos = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: productShortSelect
    })

    const productInfoMap = new Map(productInfos.map(({ id, ...rest }) => [id, rest]))

    const result = products.map(({ productOriginId, _sum }) => {
      const product = productInfoMap.get(productOriginId) ?? {}
      return {
        product,
        amountSold: _sum.amount ?? 0
      }
    })
    return result
  }
}
