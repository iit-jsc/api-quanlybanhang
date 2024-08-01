/*
  Warnings:

  - You are about to drop the column `futureShopCode` on the `FutureUsageSetting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopId,futureCode]` on the table `FutureUsageSetting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `futureCode` to the `FutureUsageSetting` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "FutureUsageSetting_shopId_futureShopCode_key";

-- AlterTable
ALTER TABLE "FutureUsageSetting" DROP COLUMN "futureShopCode",
ADD COLUMN     "futureCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FutureUsageSetting_shopId_futureCode_key" ON "FutureUsageSetting"("shopId", "futureCode");
