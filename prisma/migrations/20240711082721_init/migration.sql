/*
  Warnings:

  - You are about to drop the column `inventoryTransactionId` on the `Stock` table. All the data in the column will be lost.
  - Added the required column `warehouseId` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_inventoryTransactionId_fkey";

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "inventoryTransactionId",
ADD COLUMN     "warehouseId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
