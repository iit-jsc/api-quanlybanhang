import { Module } from '@nestjs/common'
import { CompensationEmployeeService } from './compensation-employee.service'
import { CompensationEmployeeController } from './compensation-employee.controller'

@Module({
  controllers: [CompensationEmployeeController],
  providers: [CompensationEmployeeService],
  exports: [CompensationEmployeeService]
})
export class CompensationEmployeeModule {}
