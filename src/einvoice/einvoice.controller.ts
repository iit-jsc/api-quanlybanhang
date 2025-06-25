import { Controller } from '@nestjs/common'
import { EInvoiceService } from './einvoice.service'

@Controller('einvoice')
export class EInvoiceController {
  constructor(private readonly eInvoiceService: EInvoiceService) {}
}
