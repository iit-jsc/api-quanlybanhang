import { DynamicModule, Global, Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { VnpayService } from './vnpay.service'
import { VnpayController } from './vnpay.controller'
import { TrashController } from 'src/trash/trash.controller'
import { TrashService } from 'src/trash/trash.service'

@Global()
@Module({
  imports: [HttpModule],
  controllers: [TrashController],
  providers: [TrashService]
})
export class VnpayModule {
  static forRoot(options?: { isGlobal?: boolean }): DynamicModule {
    return {
      module: VnpayModule,
      global: options?.isGlobal ?? false,
      imports: [HttpModule],
      providers: [VnpayService],
      exports: [VnpayService],
      controllers: [VnpayController]
    }
  }
}
