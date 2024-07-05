/*
  Warnings:

  - A unique constraint covering the columns `[customerId]` on the table `PointAccumulation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopId]` on the table `PointSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PointAccumulation_customerId_key" ON "PointAccumulation"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "PointSetting_shopId_key" ON "PointSetting"("shopId");
