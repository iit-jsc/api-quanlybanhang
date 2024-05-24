import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService],
  imports: [CommonModule],
})
export class CustomerModule {}
