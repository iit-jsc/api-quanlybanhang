import { Module } from "@nestjs/common";
import { CompensationSettingService } from "./compensation-setting.service";
import { CompensationSettingController } from "./compensation-setting.controller";

@Module({
  controllers: [CompensationSettingController],
  providers: [CompensationSettingService],
})
export class CompensationSettingModule {}
