import { Module } from '@nestjs/common'
import { InvoiceProviderService } from './invoice-provider.service'
import { InvoiceProviderController } from './invoice-provider.controller'
import { PrismaService } from 'nestjs-prisma'

@Module({
  controllers: [InvoiceProviderController],
  providers: [InvoiceProviderService, PrismaService]
})
export class InvoiceProviderModule {}
