import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { GatewayModule } from 'src/gateway/gateway.module'

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [GatewayModule]
})
export class OrderModule {}
