/*
  Warnings:

  - A unique constraint covering the columns `[branchId,code]` on the table `DiscountCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_branchId_code_key" ON "DiscountCode"("branchId", "code");
