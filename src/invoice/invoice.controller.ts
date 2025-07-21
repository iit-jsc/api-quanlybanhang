import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query
} from '@nestjs/common'
import { InvoiceService } from './invoice.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { CreateInvoiceDto } from './dto/invoice.dto'
import { FindManyDto } from 'utils/Common.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async createInvoice(@Body() data: CreateInvoiceDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req
    return this.invoiceService.createInvoice(data, accountId, branchId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getInvoices(@Req() req: RequestJWT, @Query() data: FindManyDto) {
    const { branchId } = req
    return this.invoiceService.getInvoicesByBranch(data, branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getInvoiceById(@Param('id') id: string, @Req() req: RequestJWT) {
    const { branchId } = req
    return this.invoiceService.getInvoiceById(id, branchId)
  }
}
