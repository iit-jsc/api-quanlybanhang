import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [CommonModule],
})
export class OrderModule {}
