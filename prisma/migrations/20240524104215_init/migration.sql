/*
  Warnings:

  - A unique constraint covering the columns `[code,shopId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,shopId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone,shopId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_shopId_key" ON "Customer"("code", "shopId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_shopId_key" ON "Customer"("email", "shopId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_shopId_key" ON "Customer"("phone", "shopId");
