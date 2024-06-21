/*
  Warnings:

  - You are about to drop the column `sku` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug,branchId,isPublic]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_sku_branchId_isPublic_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "sku";

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_branchId_isPublic_key" ON "Product"("slug", "branchId", "isPublic");
