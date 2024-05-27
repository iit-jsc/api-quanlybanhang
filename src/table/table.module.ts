import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [TableController],
  providers: [TableService],
  imports: [CommonModule],
})
export class TableModule {}
