import { Injectable } from '@nestjs/common'
import { ReportDto } from '../dto/report.dto'
import { BaseReportService } from './base-report.service'
import { accountShortSelect } from 'responses/account.response'

@Injectable()
export class StaffReportService extends BaseReportService {
  async getBestStaffReport(params: ReportDto, branchId: string) {
    const { from, to } = params
    const where = this.buildCreatedAtFilter(from, to)

    const orderDetails = await this.prisma.orderDetail.groupBy({
      by: ['createdBy'],
      where: {
        order: this.getSuccessOrderFilter(branchId, where)
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } }
    })

    const createdByIds = orderDetails
      .map(p => p.createdBy)
      .filter(id => id !== null && id !== undefined)

    // Get account info for existing users
    const accountInfos =
      createdByIds.length > 0
        ? await this.prisma.account.findMany({
            where: { id: { in: createdByIds } },
            select: accountShortSelect
          })
        : []

    const accountInfoMap = new Map(accountInfos.map(({ id, ...rest }) => [id, rest]))

    return orderDetails.map(({ createdBy, _sum }) => ({
      account: accountInfoMap.get(createdBy) ?? { user: { name: 'Tài khoản đã xóa' } },
      amountSold: _sum.amount ?? 0
    }))
  }
}
