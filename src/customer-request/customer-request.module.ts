import { Module } from '@nestjs/common'
import { CustomerRequestService } from './customer-request.service'
import { CustomerRequestController } from './customer-request.controller'
import { GatewayModule } from 'src/gateway/gateway.module'

@Module({
  controllers: [CustomerRequestController],
  providers: [CustomerRequestService],
  imports: [GatewayModule]
})
export class CustomerRequestModule {}
