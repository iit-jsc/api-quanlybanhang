/*
  Warnings:

  - You are about to drop the column `unitId` on the `InventoryTransactionDetail` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `Stock` table. All the data in the column will be lost.
  - Added the required column `status` to the `InventoryTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventoryTransactionId` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InventoryTransactionDetail" DROP CONSTRAINT "InventoryTransactionDetail_unitId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_unitId_fkey";

-- DropIndex
DROP INDEX "Stock_productId_unitId_key";

-- AlterTable
ALTER TABLE "InventoryTransaction" ADD COLUMN     "status" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "InventoryTransactionDetail" DROP COLUMN "unitId";

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "unitId",
ADD COLUMN     "inventoryTransactionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_inventoryTransactionId_fkey" FOREIGN KEY ("inventoryTransactionId") REFERENCES "InventoryTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
