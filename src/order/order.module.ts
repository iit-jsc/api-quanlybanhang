import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { OrderCrudService } from './services/order-crud.service'
import { OrderPaymentService } from './services/order-payment.service'
import { OrderOperationsService } from './services/order-operations.service'

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderCrudService, OrderPaymentService, OrderOperationsService]
})
export class OrderModule {}
