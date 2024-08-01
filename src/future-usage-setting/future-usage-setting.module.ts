import { Module } from '@nestjs/common';
import { FutureUsageSettingService } from './future-usage-setting.service';
import { FutureUsageSettingController } from './future-usage-setting.controller';

@Module({
  controllers: [FutureUsageSettingController],
  providers: [FutureUsageSettingService],
})
export class FutureUsageSettingModule {}
