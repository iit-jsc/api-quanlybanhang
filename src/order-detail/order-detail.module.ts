import { Module } from '@nestjs/common'
import { OrderDetailService } from './order-detail.service'
import { OrderDetailController } from './order-detail.controller'
import { GatewayModule } from 'src/gateway/gateway.module'

@Module({
  controllers: [OrderDetailController],
  providers: [OrderDetailService],
  imports: [GatewayModule]
})
export class OrderDetailModule {}
