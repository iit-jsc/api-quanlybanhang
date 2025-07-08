import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { Injectable } from '@nestjs/common'
import {
  ReportAmountDto,
  ReportBestSellerDto,
  ReportDto,
  ReportRevenueDto,
  ReportSummaryDto
} from './dto/report.dto'
import { accountShortSelect } from 'responses/account.response'
import { RevenueData, RevenueReportItem, ReportSummaryData } from './report.types'

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async reportRevenue(params: ReportRevenueDto, branchId: string): Promise<RevenueReportItem[]> {
    const { from, to, type } = params
    const where = this.buildCreatedAtFilter(from, to)

    // Get revenue data grouped by time and payment method
    const revenue = await this.prisma.order.groupBy({
      by: ['createdAt', 'paymentMethodId'],
      where: {
        branchId,
        paymentStatus: PaymentStatus.SUCCESS,
        status: { not: OrderStatus.CANCELLED },
        isDraft: false,
        ...where
      },
      _sum: { orderTotal: true },
      orderBy: { createdAt: 'asc' }
    })

    // Get payment methods info for categorization
    const paymentMethodMap = await this.getPaymentMethodMap(revenue)

    // Process revenue data by time periods
    const revenueMap = this.processRevenueByTime(revenue, paymentMethodMap, type)

    // Convert to sorted array
    return this.convertToSortedArray(revenueMap, type)
  }

  /**
   * Get payment method mapping for revenue categorization
   */
  private async getPaymentMethodMap(revenue: any[]): Promise<Map<string, string>> {
    const paymentMethodIds = [...new Set(revenue.map(r => r.paymentMethodId).filter(Boolean))]

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
   * Process revenue data and group by time periods
   */
  private processRevenueByTime(
    revenue: any[],
    paymentMethodMap: Map<string, string>,
    type: string
  ): Map<string, RevenueData> {
    const revenueMap = new Map<string, RevenueData>()

    revenue.forEach(({ createdAt, paymentMethodId, _sum }) => {
      const timeKey = this.formatTimeKey(new Date(createdAt), type)
      const amount = _sum.orderTotal || 0

      // Initialize time period data if not exists
      if (!revenueMap.has(timeKey)) {
        revenueMap.set(timeKey, {
          totalRevenue: 0,
          totalCash: 0,
          totalTransfer: 0,
          totalVnpay: 0
        })
      }

      const record = revenueMap.get(timeKey)!
      record.totalRevenue += amount

      // Categorize by payment method type
      this.categorizePaymentAmount(record, amount, paymentMethodId, paymentMethodMap)
    })

    return revenueMap
  }
  /**
   * Format time key based on report type
   */
  private formatTimeKey(date: Date, type: string): string {
    const [year, month, day] = date.toISOString().split('T')[0].split('-')
    const hours = date.getHours().toString().padStart(2, '0')

    switch (type) {
      case 'hour':
        return `${day}-${month}-${year} ${hours}:00`
      case 'month':
        return `${month}-${year}`
      case 'year':
        return year
      default:
        return `${day}-${month}-${year}` // day
    }
  }

  /**
   * Categorize payment amount by method type
   */
  private categorizePaymentAmount(
    record: RevenueData,
    amount: number,
    paymentMethodId: string | null,
    paymentMethodMap: Map<string, string>
  ): void {
    const paymentType = paymentMethodId ? paymentMethodMap.get(paymentMethodId) : 'CASH'

    switch (paymentType) {
      case 'CASH':
        record.totalCash += amount
        break
      case 'BANKING':
        record.totalTransfer += amount
        break
      case 'VNPAY':
        record.totalVnpay += amount
        break
      default:
        record.totalCash += amount // Default to cash for unknown types
    }
  }
  /**
   * Convert revenue map to sorted array
   */
  private convertToSortedArray(
    revenueMap: Map<string, RevenueData>,
    type: string
  ): RevenueReportItem[] {
    return Array.from(revenueMap.entries())
      .map(([time, data]) => ({ time, ...data }))
      .sort((a, b) => {
        if (type === 'day' || type === 'hour') {
          return new Date(a.time).getTime() - new Date(b.time).getTime()
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
          paymentStatus: PaymentStatus.SUCCESS,
          branchId,
          status: { not: OrderStatus.CANCELLED },
          isDraft: false
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
  async reportBestStaff(params: ReportDto, branchId: string) {
    const { from, to } = params

    const where = this.buildCreatedAtFilter(from, to)

    const orderDetails = await this.prisma.orderDetail.groupBy({
      by: ['createdBy'],
      where: {
        order: {
          paymentStatus: PaymentStatus.SUCCESS,
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

    const createdByIds = orderDetails
      .map(p => p.createdBy)
      .filter(id => id !== null && id !== undefined)
    const accountInfos =
      createdByIds.length > 0
        ? await this.prisma.account.findMany({
            where: { id: { in: createdByIds } },
            select: accountShortSelect
          })
        : []

    const accountInfoMap = new Map(accountInfos.map(({ id, ...rest }) => [id, rest]))

    const result = orderDetails.map(({ createdBy, _sum }) => {
      const account = accountInfoMap.get(createdBy) ?? { user: { name: 'Tài khoản đã xóa' } }
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
              paymentStatus: PaymentStatus.SUCCESS,
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
            paymentStatus: PaymentStatus.SUCCESS,
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

  async reportSummary(params: ReportSummaryDto, branchId: string): Promise<ReportSummaryData> {
    const { from, to } = params
    const where = this.buildCreatedAtFilter(from, to)

    // 1. Tổng số đơn hàng và doanh thu
    const orderSummary = await this.prisma.order.aggregate({
      _count: { id: true },
      _sum: { orderTotal: true },
      where: {
        branchId,
        paymentStatus: PaymentStatus.SUCCESS,
        status: { not: OrderStatus.CANCELLED },
        isDraft: false,
        ...where
      }
    })

    // 2. Phương thức thanh toán - Group by payment method
    const paymentSummary = await this.prisma.order.groupBy({
      by: ['paymentMethodId'],
      where: {
        branchId,
        paymentStatus: PaymentStatus.SUCCESS,
        status: { not: OrderStatus.CANCELLED },
        isDraft: false,
        ...where
      },
      _sum: { orderTotal: true }
    })

    // 3. Số sản phẩm bán ra
    const productsSold = await this.prisma.orderDetail.aggregate({
      _sum: { amount: true },
      where: {
        order: {
          branchId,
          paymentStatus: PaymentStatus.SUCCESS,
          status: { not: OrderStatus.CANCELLED },
          isDraft: false,
          ...where
        }
      }
    })

    // 4. Số sản phẩm hủy
    const productsCanceled = await this.prisma.canceledOrderDetail.aggregate({
      _sum: { amount: true },
      where: {
        orderDetail: {
          order: {
            branchId,
            paymentStatus: PaymentStatus.SUCCESS,
            status: { not: OrderStatus.CANCELLED }
          }
        },
        ...where
      }
    })

    // 5. Tổng số khách hàng được thêm mới
    const newCustomers = await this.prisma.customer.count({
      where: {
        branchId,
        ...where
      }
    })

    // 6. Xử lý phương thức thanh toán
    const paymentMethodMap = await this.getPaymentMethodMap(paymentSummary)
    const paymentBreakdown = this.calculatePaymentBreakdown(paymentSummary, paymentMethodMap)

    return {
      totalOrders: orderSummary._count.id || 0,
      totalRevenue: orderSummary._sum.orderTotal || 0,
      paymentSummary: paymentBreakdown,
      totalProductsSold: productsSold._sum.amount || 0,
      totalProductsCanceled: productsCanceled._sum.amount || 0,
      totalNewCustomers: newCustomers
    }
  }

  /**
   * Tính toán breakdown theo phương thức thanh toán
   */
  private calculatePaymentBreakdown(
    paymentSummary: any[],
    paymentMethodMap: Map<string, string>
  ): { totalCash: number; totalTransfer: number; totalVnpay: number } {
    const breakdown = {
      totalCash: 0,
      totalTransfer: 0,
      totalVnpay: 0
    }

    paymentSummary.forEach(({ paymentMethodId, _sum }) => {
      const amount = _sum.orderTotal || 0
      const paymentType = paymentMethodId ? paymentMethodMap.get(paymentMethodId) : 'CASH'

      switch (paymentType) {
        case 'CASH':
          breakdown.totalCash += amount
          break
        case 'BANKING':
          breakdown.totalTransfer += amount
          break
        case 'VNPAY':
          breakdown.totalVnpay += amount
          break
        default:
          breakdown.totalCash += amount // Default to cash
      }
    })

    return breakdown
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
