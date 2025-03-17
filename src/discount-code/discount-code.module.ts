import { Module } from '@nestjs/common'
import { DiscountCodeService } from './discount-code.service'
import { DiscountCodeController } from './discount-code.controller'
import { CommonModule } from 'src/common/common.module'

@Module({
  controllers: [DiscountCodeController],
  providers: [DiscountCodeService],
  imports: [CommonModule]
})
export class DiscountCodeModule {}
