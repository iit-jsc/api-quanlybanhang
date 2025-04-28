import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ReportProductDto, ReportRevenueDto } from './dto/report.dto'
import { endOfDay, startOfDay } from 'utils/Helps'
import { Prisma } from '@prisma/client'
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

    const formatKey = (date: Date) => {
      const iso = date.toISOString().split('T')[0] // yyyy-MM-dd
      const [year, month, day] = iso.split('-')
      if (type === 'month') return `${month}-${year}`
      if (type === 'year') return year
      return `${day}-${month}-${year}` // dd-MM-yyyy
    }

    const grouped = new Map<string, number>()

    for (const { createdAt, _sum } of revenue) {
      const key = formatKey(new Date(createdAt))
      grouped.set(key, (grouped.get(key) || 0) + (_sum.orderTotal || 0))
    }

    return Array.from(grouped.entries())
      .map(([time, totalRevenue]) => ({ time, totalRevenue }))
      .sort((a, b) => {
        if (type === 'day') {
          const [d1, m1, y1] = a.time.split('-').map(Number)
          const [d2, m2, y2] = b.time.split('-').map(Number)
          return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime()
        }
        return a.time.localeCompare(b.time)
      })
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
      select: {
        id: true,
        name: true,
        code: true,
        price: true,
        thumbnail: true
      }
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
