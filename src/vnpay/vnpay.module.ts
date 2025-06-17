import { DynamicModule, Global, Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { VNPayService } from './vnpay.service'
import { VNPayController } from './vnpay.controller'
import { TrashController } from 'src/trash/trash.controller'
import { TrashService } from 'src/trash/trash.service'
import {
  MerchantService,
  ChecksumService,
  QrCodeService,
  VNPayTransactionService,
  VNPayOrderService,
  PaymentCallbackService,
  CheckVNPayTransactionService
} from './services'
import { TableGatewayHandler } from 'src/gateway/handlers/table.handler'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'

@Global()
@Module({
  imports: [HttpModule],
  controllers: [TrashController],
  providers: [
    TrashService,
    MerchantService,
    ChecksumService,
    QrCodeService,
    VNPayTransactionService,
    VNPayOrderService,
    PaymentCallbackService,
    CheckVNPayTransactionService,
    TableGatewayHandler,
    OrderGatewayHandler
  ]
})
export class VnpayModule {
  static forRoot(options?: { isGlobal?: boolean }): DynamicModule {
    return {
      module: VnpayModule,
      global: options?.isGlobal ?? false,
      imports: [HttpModule],
      providers: [
        VNPayService,
        MerchantService,
        ChecksumService,
        QrCodeService,
        VNPayTransactionService,
        VNPayOrderService,
        PaymentCallbackService,
        CheckVNPayTransactionService,
        TableGatewayHandler,
        OrderGatewayHandler
      ],
      exports: [VNPayService],
      controllers: [VNPayController]
    }
  }
}
