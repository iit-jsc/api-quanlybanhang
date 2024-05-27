/*
  Warnings:

  - A unique constraint covering the columns `[code,shopId,isPublic]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,shopId,isPublic]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone,shopId,isPublic]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku,branchId,isPublic]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,branchId,isPublic]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier,branchId,isPublic]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier,branchId,isPublic]` on the table `ProductType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,branchId,isPublic]` on the table `Table` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Customer_code_shopId_key";

-- DropIndex
DROP INDEX "Customer_email_shopId_key";

-- DropIndex
DROP INDEX "Customer_phone_shopId_key";

-- DropIndex
DROP INDEX "Product_code_branchId_key";

-- DropIndex
DROP INDEX "Product_identifier_branchId_key";

-- DropIndex
DROP INDEX "Product_sku_branchId_key";

-- DropIndex
DROP INDEX "ProductType_identifier_branchId_key";

-- DropIndex
DROP INDEX "Table_code_branchId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_shopId_isPublic_key" ON "Customer"("code", "shopId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_shopId_isPublic_key" ON "Customer"("email", "shopId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_shopId_isPublic_key" ON "Customer"("phone", "shopId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_branchId_isPublic_key" ON "Product"("sku", "branchId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_branchId_isPublic_key" ON "Product"("code", "branchId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Product_identifier_branchId_isPublic_key" ON "Product"("identifier", "branchId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "ProductType_identifier_branchId_isPublic_key" ON "ProductType"("identifier", "branchId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Table_code_branchId_isPublic_key" ON "Table"("code", "branchId", "isPublic");
