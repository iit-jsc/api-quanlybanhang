import { Injectable } from '@nestjs/common'
import {
  ReportAmountDto,
  ReportBestSellerDto,
  ReportDto,
  ReportRevenueDto,
  ReportSummaryDto
} from './dto/report.dto'
import { RevenueReportItem, ReportSummaryData } from './report.types'
import { BestSellerReportService } from './services/best-seller-report.service'
import { RevenueReportService } from './services/revenue-report.service'
import { StaffReportService } from './services/staff-report.service'
import { SummaryReportService } from './services/summary-report.service'

@Injectable()
export class ReportService {
  constructor(
    private readonly revenueReportService: RevenueReportService,
    private readonly bestSellerReportService: BestSellerReportService,
    private readonly staffReportService: StaffReportService,
    private readonly summaryReportService: SummaryReportService
  ) {}

  async reportRevenue(params: ReportRevenueDto, branchId: string): Promise<RevenueReportItem[]> {
    return this.revenueReportService.getRevenueReport(params, branchId)
  }

  async reportBestSeller(params: ReportBestSellerDto, branchId: string) {
    return this.bestSellerReportService.getBestSellerReport(params, branchId)
  }

  async reportBestStaff(params: ReportDto, branchId: string) {
    return this.staffReportService.getBestStaffReport(params, branchId)
  }

  async reportSummary(params: ReportSummaryDto, branchId: string): Promise<ReportSummaryData> {
    return this.summaryReportService.getSummaryReport(params, branchId)
  }

  async reportAmount(params: ReportAmountDto, branchId: string) {
    return this.summaryReportService.getAmountReport(params, branchId)
  }
}
