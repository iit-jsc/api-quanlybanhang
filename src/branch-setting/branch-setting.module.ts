import { Module } from '@nestjs/common'
import { BranchSettingService } from './branch-setting.service'
import { BranchSettingController } from './branch-setting.controller'

@Module({
  controllers: [BranchSettingController],
  providers: [BranchSettingService]
})
export class BranchSettingModule {}
