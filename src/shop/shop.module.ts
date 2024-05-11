import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { AccountService } from 'src/account/account.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [ShopService, AccountService, UserService],
  controllers: [ShopController],
  imports: [],
})
export class ShopModule {}
