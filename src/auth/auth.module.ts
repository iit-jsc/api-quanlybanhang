import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { TokenService } from './services/token.service'
import { PasswordService } from './services/password.service'
import { AccountAccessService } from './services/account-access.service'
import { RegistrationService } from './services/registration.service'
import { RoleService } from 'src/shop/services/role.service'
import { UserService } from 'src/shop/services/user.service'
import { CustomerService } from 'src/shop/services/customer.service'
import { ProductService } from 'src/shop/services/product.service'
import { AreaService } from 'src/shop/services/area.service'
import { PaymentMethodService } from 'src/shop/services/payment-method.service'

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    PasswordService,
    AccountAccessService,
    RegistrationService,
    RoleService,
    UserService,
    CustomerService,
    ProductService,
    AreaService,
    PaymentMethodService
  ],
  exports: [AuthService, TokenService, PasswordService, AccountAccessService]
})
export class AuthModule {}
