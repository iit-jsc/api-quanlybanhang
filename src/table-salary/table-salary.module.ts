import { Module } from '@nestjs/common';
import { TableSalaryService } from './table-salary.service';
import { TableSalaryController } from './table-salary.controller';

@Module({
  controllers: [TableSalaryController],
  providers: [TableSalaryService],
})
export class TableSalaryModule {}
