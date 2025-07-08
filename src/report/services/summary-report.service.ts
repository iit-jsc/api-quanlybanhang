import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { ReportAmountDto, ReportSummaryDto } from '../dto/report.dto'
import { ReportSummaryData } from '../report.types'
import { BaseReportService } from './base-report.service'

@Injectable()
export class SummaryReportService extends BaseReportService {
  async getSummaryReport(params: ReportSummaryDto, branchId: string): Promise<ReportSummaryData> {
    const { from, to } = params
    const where = this.buildCreatedAtFilter(from, to)
    const orderFilter = this.getSuccessOrderFilter(branchId, where)

    // Run all queries in parallel for better performance
    const [orderSummary, paymentSummary, productsSold, productsCanceled, newCustomers] =
      await Promise.all([
        this.getOrderSummary(orderFilter),
        this.getPaymentSummary(orderFilter),
        this.getProductsSold(branchId, where),
        this.getProductsCanceled(branchId, where),
        this.getNewCustomers(branchId, where)
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
    const where = this.buildCreatedAtFilter(from, to)

    switch (type) {
      case Prisma.ModelName.Product:
        return this.prisma.product.count({ where: { branchId, ...where } })

      case Prisma.ModelName.CanceledOrderDetail:
        const canceled = await this.getProductsCanceled(branchId, where)
        return canceled._sum.amount || 0

      case Prisma.ModelName.OrderDetail:
        const sold = await this.getProductsSold(branchId, where)
        return sold._sum.amount || 0

      default:
        return 0
    }
  }

  private async getOrderSummary(orderFilter: any) {
    return this.prisma.order.aggregate({
      _count: { id: true },
      _sum: { orderTotal: true },
      where: orderFilter
    })
  }

  private async getPaymentSummary(orderFilter: any) {
    return this.prisma.order.groupBy({
      by: ['paymentMethodId'],
      where: orderFilter,
      _sum: { orderTotal: true }
    })
  }

  private async getProductsSold(branchId: string, where: any) {
    return this.prisma.orderDetail.aggregate({
      _sum: { amount: true },
      where: {
        order: this.getSuccessOrderFilter(branchId, where)
      }
    })
  }

  private async getProductsCanceled(branchId: string, where: any) {
    return this.prisma.canceledOrderDetail.aggregate({
      _sum: { amount: true },
      where: {
        orderDetail: {
          order: {
            branchId,
            paymentStatus: 'SUCCESS',
            status: { not: 'CANCELLED' }
          }
        },
        ...where
      }
    })
  }

  private async getNewCustomers(branchId: string, where: any) {
    return this.prisma.customer.count({
      where: { branchId, ...where }
    })
  }

  /**
   * Calculate payment breakdown by method type
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
      const paymentType = this.categorizeByPaymentType(paymentMethodId, paymentMethodMap)

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
      }
    })

    return breakdown
  }
}
