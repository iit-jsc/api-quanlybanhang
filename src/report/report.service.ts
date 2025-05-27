import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ReportAmountDto, ReportBestSellerDto, ReportDto, ReportRevenueDto } from './dto/report.dto'
import { OrderStatus, Prisma } from '@prisma/client'
import { accountShortSelect } from 'responses/account.response'
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
        isDraft: false,
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
        order: {
          isPaid: true,
          branchId,
          status: { not: OrderStatus.CANCELLED },
          isDraft: false,
          ...where
        }
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

  async reportBestStaff(params: ReportDto, branchId: string) {
    const { from, to } = params

    const where = this.buildCreatedAtFilter(from, to)

    const orderDetails = await this.prisma.orderDetail.groupBy({
      by: ['createdBy'],
      where: {
        order: {
          isPaid: true,
          branchId,
          status: { not: OrderStatus.CANCELLED },
          isDraft: false,
          ...where
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    })

    const createdByIds = orderDetails.map(p => p.createdBy)

    if (!createdByIds || !createdByIds.length) {
      return []
    }

    const accountInfos = await this.prisma.account.findMany({
      where: { id: { in: createdByIds || [] } },
      select: accountShortSelect
    })

    const accountInfoMap = new Map(accountInfos.map(({ id, ...rest }) => [id, rest]))

    const result = orderDetails.map(({ createdBy, _sum }) => {
      const account = accountInfoMap.get(createdBy) ?? {}
      return {
        account,
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
      const result = await this.prisma.canceledOrderDetail.aggregate({
        _sum: {
          amount: true
        },
        where: {
          orderDetail: {
            order: {
              isPaid: true,
              branchId,
              status: { not: OrderStatus.CANCELLED }
            }
          },
          ...where
        }
      })

      return result._sum.amount || 0
    }

    if (type === Prisma.ModelName.OrderDetail) {
      const result = await this.prisma.orderDetail.aggregate({
        _sum: {
          amount: true
        },
        where: {
          branchId,
          order: {
            isPaid: true,
            status: { not: OrderStatus.CANCELLED },
            isDraft: false
          },
          ...where
        }
      })

      return result._sum.amount || 0
    }

    return
  }

  buildCreatedAtFilter(from?: Date, to?: Date): any {
    const where: any = {}

    if (from && to) {
      where.createdAt = {
        gte: from,
        lte: to
      }
    } else if (from && !to) {
      where.createdAt = {
        gte: from
      }
    } else if (!from && to) {
      where.createdAt = {
        lte: to
      }
    }

    return where
  }
}
