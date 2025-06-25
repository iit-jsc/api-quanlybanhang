import { Module } from '@nestjs/common'
import { ShopService } from './shop.service'
import { ShopController } from './shop.controller'
import { ShopSetupService } from './services/shop-setup.service'
import { BranchService } from './services/branch.service'
import { RoleService } from './services/role.service'
import { UserService } from './services/user.service'
import { CustomerService } from './services/customer.service'
import { AreaService } from './services/area.service'
import { PaymentMethodService } from './services/payment-method.service'
import { ProductService } from './services/product.service'

@Module({
  providers: [
    ShopService,
    ShopSetupService,
    BranchService,
    RoleService,
    UserService,
    CustomerService,
    AreaService,
    PaymentMethodService,
    ProductService
  ],
  controllers: [ShopController],
  exports: [ShopService]
})
export class ShopModule {}
