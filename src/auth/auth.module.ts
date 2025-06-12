import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { ShopService } from 'src/shop/shop.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, ShopService],
  exports: [AuthService]
})
export class AuthModule {}
