import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ReportAmountDto, ReportBestSellerDto, ReportRevenueDto } from './dto/report.dto'
import { endOfDay, startOfDay } from 'utils/Helps'
import { OrderStatus, Prisma } from '@prisma/client'
@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async reportRevenue(params: ReportRevenueDto, branchId: string) {
    const { from, to, type } = params

    const where = this.buildCreatedAtFilter(from, to)

    // Perform groupBy query
    const revenue = await this.prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        branchId,
        isPaid: true,
        status: { not: OrderStatus.CANCELLED },
        ...where
      },
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
      if (type === 'hour') {
        const hours = date.getHours().toString().padStart(2, '0')
        return `${day}-${month}-${year} ${hours}:00`
      }
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
        if (type === 'day' || type === 'hour') {
          const dateA = new Date(a.time)
          const dateB = new Date(b.time)
          return dateA.getTime() - dateB.getTime()
        }
        return a.time.localeCompare(b.time)
      })
  }

  async reportBestSeller(params: ReportBestSellerDto, branchId: string) {
    const { from, to } = params

    const where = this.buildCreatedAtFilter(from, to)

    const products = await this.prisma.orderDetail.groupBy({
      by: ['productOriginId'],
      where: {
        branchId,
        order: {
          isPaid: true,
          status: { not: OrderStatus.CANCELLED }
        },
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

  async reportAmount(params: ReportAmountDto, branchId: string) {
    const { from, to, type } = params

    const where = this.buildCreatedAtFilter(from, to)

    if (type === Prisma.ModelName.Product) {
      return this.prisma.product.count({ where: { branchId, ...where } })
    }

    if (type === Prisma.ModelName.CanceledOrderDetail) {
      return this.prisma.canceledOrderDetail.count({
        where: { orderDetail: { branchId }, ...where }
      })
    }

    return
  }

  buildCreatedAtFilter(from?: Date, to?: Date): any {
    const where: any = {}

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

    return where
  }
}
