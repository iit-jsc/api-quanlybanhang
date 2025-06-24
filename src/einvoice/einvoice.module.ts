import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { EInvoiceService } from './einvoice.service'
import { EInvoiceController } from './einvoice.controller'

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5
    }),
    ConfigModule
  ],
  controllers: [EInvoiceController],
  providers: [EInvoiceService],
  exports: [EInvoiceService]
})
export class EInvoiceModule {}
