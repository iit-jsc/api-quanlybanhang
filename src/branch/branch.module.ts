import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { UserModule } from 'src/user/user.module';
import { EmployeeGroupModule } from 'src/employee-group/employee-group.module';

@Module({
  controllers: [BranchController],
  providers: [BranchService],
  imports: [UserModule, EmployeeGroupModule],
})
export class BranchModule {}
