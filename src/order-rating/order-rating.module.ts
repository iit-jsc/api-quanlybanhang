import { Module } from '@nestjs/common';
import { OrderRatingService } from './order-rating.service';
import { OrderRatingController } from './order-rating.controller';

@Module({
  controllers: [OrderRatingController],
  providers: [OrderRatingService],
})
export class OrderRatingModule {}
