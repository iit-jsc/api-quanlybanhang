import { Module } from '@nestjs/common'
import { TaxSettingService } from './tax-setting.service'
import { TaxSettingController } from './tax-setting.controller'
import { ActivityLogModule } from 'src/activity-log/activity-log.module'

@Module({
  imports: [ActivityLogModule],
  controllers: [TaxSettingController],
  providers: [TaxSettingService],
  exports: [TaxSettingService]
})
export class TaxSettingModule {}
