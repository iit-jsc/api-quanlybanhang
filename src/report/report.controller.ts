import { Body, Controller, Get, HttpCode, HttpStatus, Query, Req, UseGuards } from "@nestjs/common";
import { ReportService } from "./report.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import { ReportCustomerDto, ReportProductDto, ReportSaleDto } from "./dto/report.dto";

@Controller("report")
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
  @Get("/sale")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportSale(@Req() req: any, @Query() reportSaleDto: ReportSaleDto) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.reportService.reportSale(reportSaleDto, tokenPayload);
  }

  @Get("/customer")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportCustomer(@Req() req: any, @Query() reportCustomerDto: ReportCustomerDto) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.reportService.reportCustomer(reportCustomerDto, tokenPayload);
  }

  @Get("/product")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportProduct(@Req() req: any, @Query() reportProductDto: ReportProductDto) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.reportService.reportProduct(reportProductDto, tokenPayload);
  }
}
