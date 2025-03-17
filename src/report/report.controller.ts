import { Controller } from '@nestjs/common'
import { ReportService } from './report.service'

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // @Get('/customer')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // reportCustomer(
  //   @Req() req: any,
  //   @Query() reportCustomerDto: ReportCustomerDto
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.reportService.reportCustomer(reportCustomerDto, tokenPayload)
  // }

  // @Get('/product')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // reportProduct(@Req() req: any, @Query() reportProductDto: ReportProductDto) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.reportService.reportProduct(reportProductDto, tokenPayload)
  // }

  // @Get('/warehouse')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // reportWarehouse(
  //   @Req() req: any,
  //   @Query() reportWareHouseDto: ReportWareHouseDto
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.reportService.reportWarehouse(reportWareHouseDto, tokenPayload)
  // }

  // @Get('/employee')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // reportEmployee(
  //   @Req() req: any,
  //   @Query() reportEmployeeDto: ReportEmployeeDto
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.reportService.reportEmployee(reportEmployeeDto, tokenPayload)
  // }
}
