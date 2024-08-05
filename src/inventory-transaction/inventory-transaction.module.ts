import { Module } from "@nestjs/common";
import { InventoryTransactionService } from "./inventory-transaction.service";
import { InventoryTransactionController } from "./inventory-transaction.controller";
import { CommonModule } from "src/common/common.module";

@Module({
  controllers: [InventoryTransactionController],
  providers: [InventoryTransactionService],
  imports: [CommonModule],
})
export class InventoryTransactionModule {}
