/*
  Warnings:

  - You are about to drop the column `isInitialStock` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[branchId,sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[branchId,code]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[branchId,identifier]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier,branchId]` on the table `ProductType` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isInitialStock",
ALTER COLUMN "retailPrice" SET DEFAULT 0,
ALTER COLUMN "wholesalePrice" SET DEFAULT 0,
ALTER COLUMN "importPrice" SET DEFAULT 0,
ALTER COLUMN "isCombo" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Product_branchId_sku_key" ON "Product"("branchId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_branchId_code_key" ON "Product"("branchId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_branchId_identifier_key" ON "Product"("branchId", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "ProductType_identifier_branchId_key" ON "ProductType"("identifier", "branchId");
