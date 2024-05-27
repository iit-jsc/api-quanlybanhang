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
import { jwtConstants } from 'utils/Constants';
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

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '48h' },
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService, TransformInterceptor, PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'measurement-unit', method: RequestMethod.POST });
  }
}
