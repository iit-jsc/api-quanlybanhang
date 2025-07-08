import { Prisma } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { ReportAmountDto, ReportSummaryDto } from '../dto/report.dto'
import { ReportSummaryData } from '../report.types'
import { BaseReportService } from './base-report.service'

@Injectable()
export class SummaryReportService extends BaseReportService {
  async getSummaryReport(params: ReportSummaryDto, branchId: string): Promise<ReportSummaryData> {
    const { from, to } = params
    const dateFilter = this.buildCreatedAtFilter(from, to)
    const orderFilter = this.getSuccessOrderFilter(branchId, dateFilter)

    // Run all queries in parallel for better performance
    const [orderSummary, paymentSummary, productsSold, productsCanceled, newCustomers] =
      await Promise.all([
        this.getOrderSummary(orderFilter),
        this.getPaymentSummary(orderFilter),
        this.getProductsSold(branchId, dateFilter),
        this.getProductsCanceled(branchId, dateFilter),
        this.getNewCustomers(branchId, dateFilter)
      ])

    // Process payment breakdown
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

  async getAmountReport(params: ReportAmountDto, branchId: string) {
    const { from, to, type } = params
    const dateFilter = this.buildCreatedAtFilter(from, to)

    switch (type) {
      case Prisma.ModelName.Product:
        return this.prisma.product.count({
          where: {
            branchId,
            ...dateFilter
          }
        })

      case Prisma.ModelName.CanceledOrderDetail:
        const canceled = await this.getProductsCanceled(branchId, dateFilter)
        return canceled._sum.amount || 0

      case Prisma.ModelName.OrderDetail:
        const sold = await this.getProductsSold(branchId, dateFilter)
        return sold._sum.amount || 0

      default:
        return 0
    }
  }
  private async getOrderSummary(orderFilter: Prisma.OrderWhereInput) {
    return this.prisma.order.aggregate({
      _count: { id: true },
      _sum: { orderTotal: true },
      where: orderFilter
    })
  }

  private async getPaymentSummary(orderFilter: Prisma.OrderWhereInput) {
    return this.prisma.order.groupBy({
      by: ['paymentMethodId'],
      where: orderFilter,
      _sum: { orderTotal: true }
    })
  }
  private async getProductsSold(
    branchId: string,
    dateFilter: { createdAt?: { gte?: Date; lte?: Date } }
  ) {
    return this.prisma.orderDetail.aggregate({
      _sum: { amount: true },
      where: {
        order: this.getSuccessOrderFilter(branchId, dateFilter)
      }
    })
  }
  private async getProductsCanceled(
    branchId: string,
    dateFilter: { createdAt?: { gte?: Date; lte?: Date } }
  ) {
    return this.prisma.canceledOrderDetail.aggregate({
      _sum: { amount: true },
      where: {
        orderDetail: {
          branchId
        },
        ...dateFilter
      }
    })
  }
  private async getNewCustomers(
    branchId: string,
    where: Prisma.CustomerWhereInput
  ): Promise<number> {
    return this.prisma.customer.count({
      where: {
        shop: {
          branches: {
            some: {
              id: branchId
            }
          }
        },
        ...where
      }
    })
  }
  /**
   * Calculate payment breakdown by method type
   */
  private calculatePaymentBreakdown(
    paymentSummary: Array<{ paymentMethodId: string; _sum: { orderTotal: number | null } }>,
    paymentMethodMap: Map<string, string>
  ): { totalCash: number; totalTransfer: number; totalVNPay: number } {
    const breakdown = {
      totalCash: 0,
      totalTransfer: 0,
      totalVNPay: 0
    }

    paymentSummary.forEach(({ paymentMethodId, _sum }) => {
      const amount = _sum.orderTotal || 0
      const paymentType = this.categorizeByPaymentType(paymentMethodId, paymentMethodMap)

      switch (paymentType) {
        case 'CASH':
          breakdown.totalCash += amount
          break
        case 'BANKING':
          breakdown.totalTransfer += amount
          break
        case 'VNPAY':
          breakdown.totalVNPay += amount
          break
      }
    })

    return breakdown
  }
}
