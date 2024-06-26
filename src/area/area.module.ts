import { Module } from '@nestjs/common';
import { AreaService } from './area.service';
import { AreaController } from './area.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [AreaController],
  providers: [AreaService],
  imports: [CommonModule],
})
export class AreaModule {}
