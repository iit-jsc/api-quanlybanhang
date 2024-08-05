import { Module } from "@nestjs/common";
import { FutureUsageSettingService } from "./future-usage-setting.service";
import { FutureUsageSettingController } from "./future-usage-setting.controller";
import { CommonModule } from "src/common/common.module";

@Module({
  controllers: [FutureUsageSettingController],
  providers: [FutureUsageSettingService],
  imports: [CommonModule],
})
export class FutureUsageSettingModule {}
