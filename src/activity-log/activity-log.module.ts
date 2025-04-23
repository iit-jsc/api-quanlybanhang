import { DynamicModule, Global, Module } from '@nestjs/common'
import { ActivityLogService } from './activity-log.service'
import { ActivityLogController } from './activity-log.controller'

@Global()
@Module({
  controllers: [ActivityLogController],
  providers: [ActivityLogService]
})
export class ActivityLogModule {
  static forRoot(options?: { isGlobal?: boolean }): DynamicModule {
    return {
      module: ActivityLogModule,
      global: options?.isGlobal ?? false,
      providers: [ActivityLogService],
      exports: [ActivityLogService],
      controllers: [ActivityLogController]
    }
  }
}
