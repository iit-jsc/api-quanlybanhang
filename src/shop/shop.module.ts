import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { EmployeeGroupModule } from 'src/employee-group/employee-group.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  providers: [ShopService],
  controllers: [ShopController],
  exports: [ShopService],
  imports: [EmployeeGroupModule, CommonModule],
})
export class ShopModule {}
