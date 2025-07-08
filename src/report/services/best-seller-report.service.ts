import { Injectable } from '@nestjs/common'
import { ReportBestSellerDto } from '../dto/report.dto'
import { BaseReportService } from './base-report.service'

@Injectable()
export class BestSellerReportService extends BaseReportService {
  async getBestSellerReport(params: ReportBestSellerDto, branchId: string) {
    const { from, to } = params
    const where = this.buildCreatedAtFilter(from, to)

    const products = await this.prisma.orderDetail.groupBy({
      by: ['productOriginId'],
      where: {
        order: this.getSuccessOrderFilter(branchId),
        ...where
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
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

    return products.map(({ productOriginId, _sum }) => ({
      product: productInfoMap.get(productOriginId) ?? {},
      amountSold: _sum.amount ?? 0
    }))
  }
}
