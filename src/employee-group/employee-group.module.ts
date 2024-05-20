import { Module } from '@nestjs/common';
import { EmployeeGroupService } from './employee-group.service';
import { EmployeeGroupController } from './employee-group.controller';

@Module({
  providers: [EmployeeGroupService],
  controllers: [EmployeeGroupController],
  exports: [EmployeeGroupService],
})
export class EmployeeGroupModule {}
