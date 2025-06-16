import { Module } from '@nestjs/common'
import { TableService } from './table.service'
import { TableController } from './table.controller'
import { TableCrudService } from './services/table-crud.service'
import { TableOrderService } from './services/table-order.service'
import { TablePaymentService } from './services/table-payment.service'
import { TableOperationsService } from './services/table-operations.service'

@Module({
  controllers: [TableController],
  providers: [
    TableService,
    TableCrudService,
    TableOrderService,
    TablePaymentService,
    TableOperationsService
  ]
})
export class TableModule {}
