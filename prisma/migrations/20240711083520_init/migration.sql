/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Stock` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,warehouseId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "isPublic";

-- CreateIndex
CREATE UNIQUE INDEX "Stock_productId_warehouseId_key" ON "Stock"("productId", "warehouseId");
