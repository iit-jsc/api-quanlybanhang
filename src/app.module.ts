import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule, PrismaService } from 'nestjs-prisma'
import { UserModule } from './user/user.module'
import { AccountModule } from './account/account.module'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { BranchModule } from './branch/branch.module'
import { ShopModule } from './shop/shop.module'
import { JwtModule } from '@nestjs/jwt'
import { MeasurementUnitModule } from './measurement-unit/measurement-unit.module'
import { EmployeeGroupModule } from './employee-group/employee-group.module'
import { ProductTypeModule } from './product-type/product-type.module'
import { ProductModule } from './product/product.module'
import { CustomerTypeModule } from './customer-type/customer-type.module'
import { CustomerModule } from './customer/customer.module'
import { AreaModule } from './area/area.module'
import { TableModule } from './table/table.module'
import { OrderModule } from './order/order.module'
import { ReportModule } from './report/report.module'
import { BusinessTypeModule } from './business-type/business-type.module'
import { SupplierTypeModule } from './supplier-type/supplier-type.module'
import { DiscountIssueModule } from './discount-issue/discount-issue.module'
import { DiscountCodeModule } from './discount-code/discount-code.module'
import { GatewayModule } from './gateway/gateway.module'
import { OrderDetailModule } from './order-detail/order-detail.module'
import { MailerModule } from '@nestjs-modules/mailer'
import { TransformInterceptor } from 'utils/ApiResponse'
import { QrSettingModule } from './qr-setting/qr-setting.module'
import { PaymentMethodModule } from './payment-method/payment-method.module'
import { ProductOptionGroupModule } from './product-option-group/product-option-group.module'
import { CustomerRequestModule } from './customer-request/customer-request.module'
import { TrashModule } from './trash/trash.module'
import { VoucherModule } from './voucher/voucher.module'
import { RoleModule } from './role/role.module'
import { PermissionGroupModule } from './permission-group/permission-group.module'
import { NotifyModule } from './notify/notify.module'
import { CommonModule } from './common/common.module'
import { ActivityLogModule } from './activity-log/activity-log.module'
import { PermissionModule } from './permission/permission.module'
import { VnpayModule } from './vnpay/vnpay.module'

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true
    }),
    TrashModule.forRoot({
      isGlobal: true
    }),
    VnpayModule.forRoot({
      isGlobal: true
    }),
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN }
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: +process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASS
        }
      }
    }),
    GatewayModule.forRoot({
      isGlobal: true
    }),
    NotifyModule.forRoot({
      isGlobal: true
    }),
    ActivityLogModule.forRoot({
      isGlobal: true
    }),
    UserModule,
    AccountModule,
    AuthModule,
    BranchModule,
    ShopModule,
    MeasurementUnitModule,
    RoleModule,
    EmployeeGroupModule,
    ProductTypeModule,
    ProductModule,
    CustomerTypeModule,
    CustomerModule,
    AreaModule,
    TableModule,
    OrderModule,
    ReportModule,
    BusinessTypeModule,
    SupplierTypeModule,
    VoucherModule,
    DiscountIssueModule,
    DiscountCodeModule,
    OrderDetailModule,
    PermissionGroupModule,
    QrSettingModule,
    PaymentMethodModule,
    ProductOptionGroupModule,
    CustomerRequestModule,
    CommonModule,
    PermissionModule
  ],
  controllers: [AppController],
  providers: [AppService, TransformInterceptor, PrismaService]
})
export class AppModule {}
