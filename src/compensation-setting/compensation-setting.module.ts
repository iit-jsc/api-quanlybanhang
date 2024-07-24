import { Module } from "@nestjs/common";
import { CompensationSettingService } from "./compensation-setting.service";
import { CompensationSettingController } from "./compensation-setting.controller";
import { CommonModule } from "src/common/common.module";

@Module({
  controllers: [CompensationSettingController],
  providers: [CompensationSettingService],
  imports: [CommonModule],
})
export class CompensationSettingModule {}
