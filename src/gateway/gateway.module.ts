import { DynamicModule } from '@nestjs/common'
import { MainGateway } from './main.gateway'

export class GatewayModule {
  static forRoot(options?: { isGlobal?: boolean }): DynamicModule {
    return {
      module: GatewayModule,
      global: options?.isGlobal ?? false,
      providers: [MainGateway],
      exports: [MainGateway]
    }
  }
}
