-- DropForeignKey
ALTER TABLE "InventoryTransactionDetail" DROP CONSTRAINT "InventoryTransactionDetail_inventoryTransactionId_fkey";

-- AlterTable
ALTER TABLE "InventoryTransactionDetail" ADD COLUMN     "accountId" TEXT;

-- AddForeignKey
ALTER TABLE "InventoryTransactionDetail" ADD CONSTRAINT "InventoryTransactionDetail_inventoryTransactionId_fkey" FOREIGN KEY ("inventoryTransactionId") REFERENCES "InventoryTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
