import { Module } from '@nestjs/common'
import { OrderDetailService } from './order-detail.service'
import { OrderDetailController } from './order-detail.controller'
import { OrderDetailCrudService } from './services/order-detail-crud.service'
import { OrderDetailStatusService } from './services/order-detail-status.service'
import { OrderDetailOperationsService } from './services/order-detail-operations.service'

@Module({
  controllers: [OrderDetailController],
  providers: [
    OrderDetailService,
    OrderDetailCrudService,
    OrderDetailStatusService,
    OrderDetailOperationsService
  ]
})
export class OrderDetailModule {}
