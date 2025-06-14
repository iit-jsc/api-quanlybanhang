import { Controller, Get, HttpCode, HttpStatus, Query, Req, UseGuards } from '@nestjs/common'
import { ReportService } from './report.service'
import { RequestJWT } from 'interfaces/common.interface'
import { ReportAmountDto, ReportBestSellerDto, ReportDto, ReportRevenueDto } from './dto/report.dto'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('/best-seller')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportBestSeller(@Req() req: RequestJWT, @Query() data: ReportBestSellerDto) {
    const { branchId } = req
    return this.reportService.reportBestSeller(data, branchId)
  }

  @Get('/best-staff')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportBestStaff(@Req() req: RequestJWT, @Query() data: ReportDto) {
    const { branchId } = req
    return this.reportService.reportBestStaff(data, branchId)
  }

  @Get('/revenue')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportRevenue(@Req() req: RequestJWT, @Query() data: ReportRevenueDto) {
    const { branchId } = req
    return this.reportService.reportRevenue(data, branchId)
  }

  @Get('/amount')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportAmount(@Req() req: RequestJWT, @Query() data: ReportAmountDto) {
    const { branchId } = req
    return this.reportService.reportAmount(data, branchId)
  }
}
