import { Injectable } from '@nestjs/common'
import { ReportBestSellerDto } from '../dto/report.dto'
import { BaseReportService } from './base-report.service'
import { OrderStatus, PaymentStatus } from '@prisma/client'

@Injectable()
export class BestSellerReportService extends BaseReportService {
  async getBestSellerReport(params: ReportBestSellerDto, branchId: string) {
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

    const result = products
      .map(({ productOriginId, _sum }) => {
        const product = productInfoMap.get(productOriginId) ?? {}
        return {
          product,
          amountSold: _sum.amount ?? 0
        }
      })
      .filter(item => Object.keys(item.product).length > 0)

    return result
  }
}
