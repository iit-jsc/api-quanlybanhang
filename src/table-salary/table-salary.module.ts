import { Module } from "@nestjs/common";
import { TableSalaryService } from "./table-salary.service";
import { TableSalaryController } from "./table-salary.controller";
import { CommonModule } from "src/common/common.module";

@Module({
  controllers: [TableSalaryController],
  providers: [TableSalaryService],
  imports: [CommonModule],
})
export class TableSalaryModule {}
