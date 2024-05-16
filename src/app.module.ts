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
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LoggerMiddleware } from 'middlewares/check-branch.middleware';
import { PermissionModule } from './permission/permission.module';
import { EmployeeGroupModule } from './employee-group/employee-group.module';

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
