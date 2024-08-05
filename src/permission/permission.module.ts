import { Module } from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { PermissionController } from "./permission.controller";
import { CommonModule } from "src/common/common.module";

@Module({
  providers: [PermissionService],
  controllers: [PermissionController],
  exports: [PermissionService],
  imports: [CommonModule],
})
export class PermissionModule {}
