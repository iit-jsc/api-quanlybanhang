import { Body, Controller, Get, HttpCode, HttpStatus, Query, Req, UseGuards } from "@nestjs/common";
import { ReportService } from "./report.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import {
  ReportCustomerDto,
  ReportEmployeeDto,
  ReportProductDto,
  reportRevenueDto,
  ReportWareHouseDto,
} from "./dto/report.dto";

@Controller("report")
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
  @Get("/revenue")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportRevenue(@Req() req: any, @Query() reportRevenueDto: reportRevenueDto) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.reportService.reportRevenue(reportRevenueDto, tokenPayload);
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

  @Get("/warehouse")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportWarehouse(@Req() req: any, @Query() reportWareHouseDto: ReportWareHouseDto) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.reportService.reportWarehouse(reportWareHouseDto, tokenPayload);
  }

  @Get("/employee")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  reportEmployee(@Req() req: any, @Query() reportEmployeeDto: ReportEmployeeDto) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.reportService.reportEmployee(reportEmployeeDto, tokenPayload);
  }
}
