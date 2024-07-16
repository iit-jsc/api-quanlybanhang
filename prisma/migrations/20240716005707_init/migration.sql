/*
  Warnings:

  - A unique constraint covering the columns `[shopId,type]` on the table `PrintTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PrintTemplate_shopId_type_key" ON "PrintTemplate"("shopId", "type");
