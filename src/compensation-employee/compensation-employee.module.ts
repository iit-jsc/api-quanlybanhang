import { Module } from "@nestjs/common";
import { CompensationEmployeeService } from "./compensation-employee.service";
import { CompensationEmployeeController } from "./compensation-employee.controller";
import { CommonModule } from "src/common/common.module";

@Module({
  controllers: [CompensationEmployeeController],
  providers: [CompensationEmployeeService],
})
export class CompensationEmployeeModule {}
