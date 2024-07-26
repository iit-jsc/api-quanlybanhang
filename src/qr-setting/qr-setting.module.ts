import { Module } from '@nestjs/common';
import { QrSettingService } from './qr-setting.service';
import { QrSettingController } from './qr-setting.controller';

@Module({
  controllers: [QrSettingController],
  providers: [QrSettingService],
})
export class QrSettingModule {}
