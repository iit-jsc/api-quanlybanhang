import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CommonModule } from 'src/common/common.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { PointAccumulationModule } from 'src/point-accumulation/point-accumulation.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [CommonModule, GatewayModule, PointAccumulationModule],
})
export class OrderModule {}
