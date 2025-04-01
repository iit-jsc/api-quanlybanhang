import { DynamicModule, Global, Module } from '@nestjs/common'
import { NotifyService } from './notify.service'
import { NotifyController } from './notify.controller'

@Global()
@Module({
  controllers: [NotifyController],
  providers: [NotifyService]
})
export class NotifyModule {
  static forRoot(options?: { isGlobal?: boolean }): DynamicModule {
    return {
      module: NotifyModule,
      global: options?.isGlobal ?? false,
      providers: [NotifyService],
      exports: [NotifyService],
      controllers: [NotifyController]
    }
  }
}
