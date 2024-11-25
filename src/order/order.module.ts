import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CommonModule } from 'src/common/common.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { PointAccumulationModule } from 'src/point-accumulation/point-accumulation.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [CommonModule, GatewayModule, PointAccumulationModule, MailModule],
})
export class OrderModule {}
