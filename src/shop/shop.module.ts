import { Module, NestModule } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { AccountService } from 'src/account/account.service';
import { UserService } from 'src/user/user.service';
import { EmployeeGroupModule } from 'src/employee-group/employee-group.module';
import { AccountModule } from 'src/account/account.module';
import { UserModule } from 'src/user/user.module';
import { PermissionModule } from 'src/permission/permission.module';

@Module({
  providers: [ShopService],
  controllers: [ShopController],
  exports: [ShopService],
  imports: [EmployeeGroupModule, AccountModule, UserModule],
})
export class ShopModule {}
