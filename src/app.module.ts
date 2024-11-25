import { join } from "path";
import { CompensationSettingModule } from "./compensation-setting/compensation-setting.module";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule, PrismaService } from "nestjs-prisma";
import { UserModule } from "./user/user.module";
import { AccountModule } from "./account/account.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { BranchModule } from "./branch/branch.module";
import { ShopModule } from "./shop/shop.module";
import { JwtModule } from "@nestjs/jwt";
import { MeasurementUnitModule } from "./measurement-unit/measurement-unit.module";
import { PermissionModule } from "./permission/permission.module";
import { EmployeeGroupModule } from "./employee-group/employee-group.module";
import { CommonModule } from "./common/common.module";
import { ProductTypeModule } from "./product-type/product-type.module";
import { ProductModule } from "./product/product.module";
import { CustomerTypeModule } from "./customer-type/customer-type.module";
import { CustomerModule } from "./customer/customer.module";
import { AreaModule } from "./area/area.module";
import { TableModule } from "./table/table.module";
import { OrderStatusModule } from "./order-status/order-status.module";
import { OrderModule } from "./order/order.module";
import { OrderRatingModule } from "./order-rating/order-rating.module";
import { ReportModule } from "./report/report.module";
import { GroupRoleModule } from "./group-role/group-role.module";
import { ManagerModule } from "./manager/manager.module";
import { BusinessTypeModule } from "./business-type/business-type.module";
import { FirebaseModule } from "./firebase/firebase.module";
import { SupplierTypeModule } from "./supplier-type/supplier-type.module";
import { SupplierModule } from "./supplier/supplier.module";
import { PromotionModule } from "./promotion/promotion.module";
import { DiscountIssueModule } from "./discount-issue/discount-issue.module";
import { DiscountCodeModule } from "./discount-code/discount-code.module";
import { PointSettingModule } from "./point-setting/point-setting.module";
import { WarehouseModule } from "./warehouse/warehouse.module";
import { StockModule } from "./stock/stock.module";
import { InventoryTransactionModule } from "./inventory-transaction/inventory-transaction.module";
import { GatewayModule } from "./gateway/gateway.module";
import { PrintTemplateModule } from "./print-template/print-template.module";
import { PointAccumulationModule } from "./point-accumulation/point-accumulation.module";
import { PointHistoryModule } from "./point-history/point-history.module";
import { OrderDetailModule } from "./order-detail/order-detail.module";
import { TransporterModule } from "./transporter/transporter.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { WorkShiftModule } from "./work-shift/work-shift.module";
import { EmployeeScheduleModule } from "./employee-schedule/employee-schedule.module";
import { EmployeeSalaryModule } from "./employee-salary/employee-salary.module";
import { TableSalaryModule } from "./table-salary/table-salary.module";
import { TransformInterceptor } from "utils/ApiResponse";
import { CompensationEmployeeModule } from "./compensation-employee/compensation-employee.module";
import { QrSettingModule } from "./qr-setting/qr-setting.module";
import { FeatureUsageSettingModule } from "./feature-usage-setting/feature-usage-setting.module";
import { PaymentMethodModule } from "./payment-method/payment-method.module";
import { ActivityLogModule } from "./activity-log/activity-log.module";
import { ProductOptionGroupModule } from './product-option-group/product-option-group.module';
import { CustomerRequestModule } from './customer-request/customer-request.module';
import { MailModule } from './mail/mail.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

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
      signOptions: { expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: +process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASS,
        },
      },
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
    PrintTemplateModule,
    PointAccumulationModule,
    PointHistoryModule,
    OrderDetailModule,
    TransporterModule,
    WorkShiftModule,
    EmployeeScheduleModule,
    EmployeeSalaryModule,
    TableSalaryModule,
    CompensationSettingModule,
    CompensationEmployeeModule,
    QrSettingModule,
    FeatureUsageSettingModule,
    PaymentMethodModule,
    ActivityLogModule,
    ProductOptionGroupModule,
    CustomerRequestModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, TransformInterceptor, PrismaService],
})
export class AppModule {}
