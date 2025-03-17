import { Module } from '@nestjs/common'
import { PointSettingService } from './point-setting.service'
import { PointSettingController } from './point-setting.controller'
import { CommonModule } from 'src/common/common.module'

@Module({
  controllers: [PointSettingController],
  providers: [PointSettingService],
  imports: [CommonModule]
})
export class PointSettingModule {}
