import { Module } from "@nestjs/common";
import { MeasurementUnitService } from "./measurement-unit.service";
import { MeasurementUnitController } from "./measurement-unit.controller";
import { UserService } from "src/user/user.service";
import { CommonModule } from "src/common/common.module";

@Module({
  providers: [MeasurementUnitService],
  controllers: [MeasurementUnitController],
  imports: [CommonModule],
})
export class MeasurementUnitModule {}
