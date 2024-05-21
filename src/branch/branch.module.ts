import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [BranchController],
  providers: [BranchService],
  imports: [CommonModule],
})
export class BranchModule {}
