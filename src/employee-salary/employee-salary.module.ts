import { Module } from "@nestjs/common";
import { EmployeeSalaryService } from "./employee-salary.service";
import { EmployeeSalaryController } from "./employee-salary.controller";
import { CompensationEmployeeModule } from "src/compensation-employee/compensation-employee.module";

@Module({
  controllers: [EmployeeSalaryController],
  providers: [EmployeeSalaryService],
  imports: [CompensationEmployeeModule],
})
export class EmployeeSalaryModule {}
