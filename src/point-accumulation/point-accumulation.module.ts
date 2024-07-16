import { Module } from '@nestjs/common';
import { PointAccumulationService } from './point-accumulation.service';
import { PointAccumulationController } from './point-accumulation.controller';

@Module({
  controllers: [PointAccumulationController],
  providers: [PointAccumulationService],
  exports: [PointAccumulationService],
})
export class PointAccumulationModule {}
