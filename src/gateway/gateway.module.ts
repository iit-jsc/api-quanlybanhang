import { Module } from '@nestjs/common';
import { OrderGateway } from './order.gateway';
import { TableGateway } from './table.gateway';
import { CustomerRequestGateway } from './customer-request.gateway';

@Module({
  controllers: [],
  providers: [OrderGateway, TableGateway, CustomerRequestGateway],
  exports: [OrderGateway, TableGateway, CustomerRequestGateway],
})
export class GatewayModule { }
