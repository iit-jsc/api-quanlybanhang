import { DynamicModule } from '@nestjs/common'
import { MainGateway } from './main.gateway'
import { OrderGatewayHandler } from './handlers/order-gateway.handler'
import { OrderDetailGatewayHandler } from './handlers/order-detail-gateway.handler'
import { TableGatewayHandler } from './handlers/table.handler'
import { NotifyGatewayHandler } from './handlers/notify.handler'

export class GatewayModule {
  static forRoot(options?: { isGlobal?: boolean }): DynamicModule {
    return {
      module: GatewayModule,
      global: options?.isGlobal ?? false,
      providers: [
        MainGateway,
        OrderGatewayHandler,
        OrderDetailGatewayHandler,
        TableGatewayHandler,
        NotifyGatewayHandler
      ],
      exports: [
        MainGateway,
        OrderGatewayHandler,
        OrderDetailGatewayHandler,
        TableGatewayHandler,
        NotifyGatewayHandler
      ]
    }
  }
}
