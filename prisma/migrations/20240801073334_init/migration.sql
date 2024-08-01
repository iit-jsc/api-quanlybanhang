/*
  Warnings:

  - A unique constraint covering the columns `[branchId,type]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_branchId_type_key" ON "PaymentMethod"("branchId", "type");
