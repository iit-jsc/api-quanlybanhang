import { DynamicModule, Global, Module } from '@nestjs/common'
import { VnpayService } from './vnpay.service'
import { VnpayController } from './vnpay.controller'
import { TrashController } from 'src/trash/trash.controller'
import { TrashService } from 'src/trash/trash.service'

@Global()
@Module({
  controllers: [TrashController],
  providers: [TrashService]
})
export class VnpayModule {
  static forRoot(options?: { isGlobal?: boolean }): DynamicModule {
    return {
      module: VnpayModule,
      global: options?.isGlobal ?? false,
      providers: [VnpayService],
      exports: [VnpayService],
      controllers: [VnpayController]
    }
  }
}
