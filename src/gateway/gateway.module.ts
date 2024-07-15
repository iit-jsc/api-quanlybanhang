import { Module } from '@nestjs/common';
import { OrderGateway } from './order.gateway';
import { TableGateway } from './table.gateway';

@Module({
  controllers: [],
  providers: [OrderGateway, TableGateway],
  exports: [OrderGateway, TableGateway],
})
export class GatewayModule {}
