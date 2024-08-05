import { Module } from "@nestjs/common";
import { WorkShiftService } from "./work-shift.service";
import { WorkShiftController } from "./work-shift.controller";
import { CommonModule } from "src/common/common.module";

@Module({
  controllers: [WorkShiftController],
  providers: [WorkShiftService],
  imports: [CommonModule],
})
export class WorkShiftModule {}
