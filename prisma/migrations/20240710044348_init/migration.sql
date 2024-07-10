/*
  Warnings:

  - You are about to drop the column `productCode` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `InventoryTransaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,unitId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `InventoryTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryTransaction" DROP COLUMN "productCode",
DROP COLUMN "productName",
ADD COLUMN     "type" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Stock_productId_unitId_key" ON "Stock"("productId", "unitId");
