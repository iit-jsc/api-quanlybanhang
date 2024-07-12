import { Module } from '@nestjs/common';
import { OrderGateway } from './order.gateway';

@Module({
  controllers: [],
  providers: [OrderGateway],
})
export class GatewayModule {}
