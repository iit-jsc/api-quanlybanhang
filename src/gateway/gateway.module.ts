import { DynamicModule } from '@nestjs/common'
import { OrderGateway } from './order.gateway'
import { TableGateway } from './table.gateway'
import { CustomerRequestGateway } from './customer-request.gateway'
import { OrderDetailGateway } from './order-detail.gateway'

export class GatewayModule {
  static forRoot(options?: { isGlobal?: boolean }): DynamicModule {
    return {
      module: GatewayModule,
      global: options?.isGlobal ?? false,
      providers: [OrderGateway, TableGateway, CustomerRequestGateway, OrderDetailGateway],
      exports: [OrderGateway, TableGateway, CustomerRequestGateway, OrderDetailGateway],
      controllers: []
    }
  }
}
