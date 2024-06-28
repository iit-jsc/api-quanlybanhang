import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [ManagerController],
  providers: [ManagerService],
  imports: [CommonModule],
})
export class ManagerModule {}
