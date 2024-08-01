/*
  Warnings:

  - A unique constraint covering the columns `[type,branchId]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PaymentMethod_branchId_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_type_branchId_key" ON "PaymentMethod"("type", "branchId");
