import { Module } from "@nestjs/common";
import { FeatureUsageSettingService } from "./feature-usage-setting.service";
import { FeatureUsageSettingController } from "./feature-usage-setting.controller";
import { CommonModule } from "src/common/common.module";

@Module({
  controllers: [FeatureUsageSettingController],
  providers: [FeatureUsageSettingService],
  imports: [CommonModule],
})
export class FeatureUsageSettingModule {}
