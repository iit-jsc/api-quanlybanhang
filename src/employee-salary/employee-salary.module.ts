import { Module } from '@nestjs/common'
import { EmployeeSalaryService } from './employee-salary.service'
import { EmployeeSalaryController } from './employee-salary.controller'
import { CompensationEmployeeModule } from 'src/compensation-employee/compensation-employee.module'
import { CommonModule } from 'src/common/common.module'

@Module({
  controllers: [EmployeeSalaryController],
  providers: [EmployeeSalaryService],
  imports: [CompensationEmployeeModule, CommonModule]
})
export class EmployeeSalaryModule {}
