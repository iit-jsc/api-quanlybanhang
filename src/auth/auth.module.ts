import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CommonModule } from 'src/common/common.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [CommonModule, FirebaseModule],
  exports: [AuthService],
})
export class AuthModule {}
