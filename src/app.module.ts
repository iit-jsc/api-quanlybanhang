import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BranchModule } from './branch/branch.module';
import { ShopModule } from './shop/shop.module';
import { JwtModule } from '@nestjs/jwt';
import { TransformInterceptor } from 'utils/ApiResponse';
import { MeasurementUnitModule } from './measurement-unit/measurement-unit.module';
import { LoggerMiddleware } from 'middlewares/check-branch.middleware';
import { PermissionModule } from './permission/permission.module';
import { EmployeeGroupModule } from './employee-group/employee-group.module';
import { CommonModule } from './common/common.module';
import { ProductTypeModule } from './product-type/product-type.module';
import { ProductModule } from './product/product.module';
import { CustomerTypeModule } from './customer-type/customer-type.module';
import { CustomerModule } from './customer/customer.module';
import { AreaModule } from './area/area.module';
import { TableModule } from './table/table.module';
import { ToppingModule } from './topping/topping.module';
import { OrderStatusModule } from './order-status/order-status.module';
import { OrderModule } from './order/order.module';
import { OrderRatingModule } from './order-rating/order-rating.module';
import { ReportModule } from './report/report.module';
import { GroupRoleModule } from './group-role/group-role.module';
import { ManagerModule } from './manager/manager.module';
import { BusinessTypeModule } from './business-type/business-type.module';
import { FirebaseModule } from './firebase/firebase.module';
import { SupplierTypeModule } from './supplier-type/supplier-type.module';
import { SupplierModule } from './supplier/supplier.module';
import { PromotionModule } from './promotion/promotion.module';
import { DiscountIssueModule } from './discount-issue/discount-issue.module';
import { DiscountCodeModule } from './discount-code/discount-code.module';
import { PointSettingModule } from './point-setting/point-setting.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { StockModule } from './stock/stock.module';
import { InventoryTransactionModule } from './inventory-transaction/inventory-transaction.module';
import { GatewayModule } from './gateway/gateway.module';
import { OrderGateway } from './gateway/order.gateway';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '48h' },
    }),
    CommonModule,
    UserModule,
    AccountModule,
    AuthModule,
    BranchModule,
    ShopModule,
    MeasurementUnitModule,
    PermissionModule,
    EmployeeGroupModule,
    CommonModule,
    ProductTypeModule,
    ProductModule,
    CustomerTypeModule,
    CustomerModule,
    AreaModule,
    TableModule,
    ToppingModule,
    OrderStatusModule,
    OrderModule,
    OrderRatingModule,
    ReportModule,
    GroupRoleModule,
    ManagerModule,
    BusinessTypeModule,
    FirebaseModule,
    SupplierTypeModule,
    SupplierModule,
    PromotionModule,
    DiscountIssueModule,
    DiscountCodeModule,
    PointSettingModule,
    WarehouseModule,
    StockModule,
    InventoryTransactionModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService, TransformInterceptor, PrismaService],
})
export class AppModule {}
