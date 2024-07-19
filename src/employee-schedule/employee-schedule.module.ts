import { Module } from '@nestjs/common';
import { EmployeeScheduleService } from './employee-schedule.service';
import { EmployeeScheduleController } from './employee-schedule.controller';

@Module({
  controllers: [EmployeeScheduleController],
  providers: [EmployeeScheduleService],
})
export class EmployeeScheduleModule {}
