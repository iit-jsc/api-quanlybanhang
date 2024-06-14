import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { ReportSaleDto } from './dto/report-customer.dto';
import { TokenPayload } from 'interfaces/common.interface';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
  @Get('/sale')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Query() reportSaleDto: ReportSaleDto) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.reportService.reportSale(reportSaleDto, tokenPayload);
  }
}
