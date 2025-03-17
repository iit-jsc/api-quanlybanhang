import { Module } from '@nestjs/common'
import { EmployeeGroupService } from './employee-group.service'
import { EmployeeGroupController } from './employee-group.controller'
import { CommonModule } from 'src/common/common.module'

@Module({
  providers: [EmployeeGroupService],
  controllers: [EmployeeGroupController],
  exports: [EmployeeGroupService],
  imports: [CommonModule]
})
export class EmployeeGroupModule {}
