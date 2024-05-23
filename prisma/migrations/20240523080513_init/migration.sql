/*
  Warnings:

  - A unique constraint covering the columns `[sku,branchId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,branchId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier,branchId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_branchId_code_key";

-- DropIndex
DROP INDEX "Product_branchId_identifier_key";

-- DropIndex
DROP INDEX "Product_branchId_sku_key";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "code" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_branchId_key" ON "Product"("sku", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_branchId_key" ON "Product"("code", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_identifier_branchId_key" ON "Product"("identifier", "branchId");
