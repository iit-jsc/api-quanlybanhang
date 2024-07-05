import { Module } from '@nestjs/common';
import { PointSettingService } from './point-setting.service';
import { PointSettingController } from './point-setting.controller';

@Module({
  controllers: [PointSettingController],
  providers: [PointSettingService],
})
export class PointSettingModule {}
