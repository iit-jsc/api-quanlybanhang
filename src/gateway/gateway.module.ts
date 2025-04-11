import { DynamicModule } from '@nestjs/common'
import { OrderGateway } from './order.gateway'
import { TableGateway } from './table.gateway'
import { CustomerRequestGateway } from './customer-request.gateway'
import { OrderDetailGateway } from './order-detail.gateway'
import { NotifyGateway } from './notify.gateway'

export class GatewayModule {
  static forRoot(options?: { isGlobal?: boolean }): DynamicModule {
    return {
      module: GatewayModule,
      global: options?.isGlobal ?? false,
      providers: [
        OrderGateway,
        TableGateway,
        CustomerRequestGateway,
        OrderDetailGateway,
        NotifyGateway
      ],
      exports: [
        OrderGateway,
        TableGateway,
        CustomerRequestGateway,
        OrderDetailGateway,
        NotifyGateway
      ],
      controllers: []
    }
  }
}
