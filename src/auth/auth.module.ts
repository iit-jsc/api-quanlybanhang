import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CommonModule } from "src/common/common.module";
import { FirebaseModule } from "src/firebase/firebase.module";
import { TransporterModule } from "src/transporter/transporter.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [CommonModule, FirebaseModule, TransporterModule],
  exports: [AuthService],
})
export class AuthModule {}
