import { Controller } from '@nestjs/common';
import { TableSalaryService } from './table-salary.service';

@Controller('table-salary')
export class TableSalaryController {
  constructor(private readonly tableSalaryService: TableSalaryService) {}
}
