import { Module } from '@nestjs/common'
import { EmployeeScheduleService } from './employee-schedule.service'
import { EmployeeScheduleController } from './employee-schedule.controller'
import { CommonModule } from 'src/common/common.module'

@Module({
  controllers: [EmployeeScheduleController],
  providers: [EmployeeScheduleService],
  imports: [CommonModule]
})
export class EmployeeScheduleModule {}
