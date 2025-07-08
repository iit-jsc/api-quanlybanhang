import { Module } from '@nestjs/common'
import { ReportService } from './report.service'
import { ReportController } from './report.controller'
import { BaseReportService } from './services/base-report.service'
import { BestSellerReportService } from './services/best-seller-report.service'
import { RevenueReportService } from './services/revenue-report.service'
import { StaffReportService } from './services/staff-report.service'
import { SummaryReportService } from './services/summary-report.service'

@Module({
  controllers: [ReportController],
  providers: [
    ReportService,
    BaseReportService,
    RevenueReportService,
    BestSellerReportService,
    StaffReportService,
    SummaryReportService
  ]
})
export class ReportModule {}
