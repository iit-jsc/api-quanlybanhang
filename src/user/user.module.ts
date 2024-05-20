import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EmployeeGroupModule } from 'src/employee-group/employee-group.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
  imports: [EmployeeGroupModule],
})
export class UserModule {}
