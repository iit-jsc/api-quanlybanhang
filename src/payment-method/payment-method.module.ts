import { Module } from '@nestjs/common'
import { PaymentMethodService } from './payment-method.service'
import { PaymentMethodController } from './payment-method.controller'
import { CommonModule } from 'src/common/common.module'

@Module({
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService],
  imports: [CommonModule]
})
export class PaymentMethodModule {}
