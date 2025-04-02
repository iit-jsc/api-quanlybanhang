import { Module } from '@nestjs/common'
import { ShopService } from './shop.service'
import { ShopController } from './shop.controller'
import { EmployeeGroupModule } from 'src/employee-group/employee-group.module'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  providers: [ShopService],
  controllers: [ShopController],
  exports: [ShopService],
  imports: [EmployeeGroupModule, AuthModule]
})
export class ShopModule {}
