import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [BranchController],
  providers: [BranchService, UserService],
})
export class BranchModule {}
