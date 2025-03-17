import { Module } from '@nestjs/common'
import { QrSettingService } from './qr-setting.service'
import { QrSettingController } from './qr-setting.controller'
import { CommonModule } from 'src/common/common.module'

@Module({
  controllers: [QrSettingController],
  providers: [QrSettingService]
})
export class QrSettingModule {}
