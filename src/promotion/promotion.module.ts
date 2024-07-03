import { Module } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [PromotionController],
  providers: [PromotionService],
  imports: [CommonModule],
})
export class PromotionModule {}
