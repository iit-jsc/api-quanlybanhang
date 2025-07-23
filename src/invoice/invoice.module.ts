import { Module } from '@nestjs/common'
import { InvoiceController } from './invoice.controller'
import { InvoiceService } from './invoice.service'
import { VNPTElectronicInvoiceProvider } from './providers'

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, VNPTElectronicInvoiceProvider]
})
export class InvoiceModule {}
