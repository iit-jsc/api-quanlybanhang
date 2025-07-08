import { Injectable } from '@nestjs/common'
import { ReportRevenueDto } from '../dto/report.dto'
import { RevenueData, RevenueReportItem } from '../report.types'
import { BaseReportService } from './base-report.service'

@Injectable()
export class RevenueReportService extends BaseReportService {
  async getRevenueReport(params: ReportRevenueDto, branchId: string): Promise<RevenueReportItem[]> {
    const { from, to, type } = params
    const where = this.buildCreatedAtFilter(from, to)

    // Get revenue data grouped by time and payment method
    const revenue = await this.prisma.order.groupBy({
      by: ['createdAt', 'paymentMethodId'],
      where: this.getSuccessOrderFilter(branchId, where),
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
      this.addToPaymentCategory(record, amount, paymentMethodId, paymentMethodMap)
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
   * Add amount to appropriate payment category
   */
  private addToPaymentCategory(
    record: RevenueData,
    amount: number,
    paymentMethodId: string | null,
    paymentMethodMap: Map<string, string>
  ): void {
    const paymentType = this.categorizeByPaymentType(paymentMethodId, paymentMethodMap)

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
}
