import { Controller, Get, Patch, Req, UseGuards, HttpStatus, HttpCode, Body } from '@nestjs/common'
import { InvoiceProviderService } from './invoice-provider.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { UpdateAndActiveInvoiceProviderDto } from './dto/update-and-active-invoice-provider.dto'

@Controller('invoice-provider')
@UseGuards(JwtAuthGuard)
export class InvoiceProviderController {
  constructor(private readonly invoiceProviderService: InvoiceProviderService) {}

  /**
   * Lấy danh sách tất cả invoice providers của branch hiện tại
   */
  @Get()
  async findAll(@Req() req: RequestJWT) {
    return this.invoiceProviderService.findAll(req.branchId)
  }
  /**
   * Update và active một invoice provider theo providerType
   */
  @Patch('update-and-active')
  @HttpCode(HttpStatus.OK)
  async updateAndActive(@Body() data: UpdateAndActiveInvoiceProviderDto) {
    return this.invoiceProviderService.updateAndActive(data, data.branchId)
  }
}
