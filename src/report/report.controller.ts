import { Controller, Get, HttpCode, HttpStatus, Query, Req, UseGuards } from '@nestjs/common'
import { ReportService } from './report.service'
import { RequestJWT } from 'interfaces/common.interface'
import { ReportProductDto, ReportRevenueDto } from './dto/report.dto'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('/product')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportCustomer(@Req() req: RequestJWT, @Query() data: ReportProductDto) {
    const { branchId } = req
    return this.reportService.reportProduct(data, branchId)
  }

  @Get('/revenue')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportRevenue(@Req() req: RequestJWT, @Query() data: ReportRevenueDto) {
    const { branchId } = req
    return this.reportService.reportRevenue(data, branchId)
  }
}
