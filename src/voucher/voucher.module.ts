import { Module } from '@nestjs/common'
import { VoucherService } from './voucher.service'
import { VoucherController } from './voucher.controller'

@Module({
  controllers: [VoucherController],
  providers: [VoucherService],
  imports: []
})
export class VoucherModule {}
