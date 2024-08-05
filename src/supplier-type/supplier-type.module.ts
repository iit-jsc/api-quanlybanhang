import { Module } from "@nestjs/common";
import { SupplierTypeService } from "./supplier-type.service";
import { SupplierTypeController } from "./supplier-type.controller";
import { CommonModule } from "src/common/common.module";

@Module({
  controllers: [SupplierTypeController],
  providers: [SupplierTypeService],
  imports: [CommonModule],
})
export class SupplierTypeModule {}
