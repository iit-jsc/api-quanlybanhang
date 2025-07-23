import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { ExportInvoicesDto } from './dto/invoice.dto'
import { InvoiceService } from './invoice.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('export-batch')
  @HttpCode(HttpStatus.OK)
  async exportInvoices(@Body() data: ExportInvoicesDto, @Req() req: RequestJWT) {
    return await this.invoiceService.exportInvoices(data, req.accountId, req.branchId)
  }
}
