/*
  Warnings:

  - You are about to drop the column `createdBy` on the `PointAccumulation` table. All the data in the column will be lost.
  - You are about to drop the column `amountRedeemed` on the `PointRedemption` table. All the data in the column will be lost.
  - You are about to drop the column `pointToRedeem` on the `PointRedemption` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PointRedemption` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `PointRedemption` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PointSetting` table. All the data in the column will be lost.
  - You are about to drop the column `pointType` on the `PointSetting` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PointSetting` table. All the data in the column will be lost.
  - You are about to drop the `PointAccumulationHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `point` to the `PointRedemption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PointAccumulationHistory" DROP CONSTRAINT "PointAccumulationHistory_branchId_fkey";

-- DropForeignKey
ALTER TABLE "PointAccumulationHistory" DROP CONSTRAINT "PointAccumulationHistory_orderId_fkey";

-- AlterTable
ALTER TABLE "PointAccumulation" DROP COLUMN "createdBy";

-- AlterTable
ALTER TABLE "PointRedemption" DROP COLUMN "amountRedeemed",
DROP COLUMN "pointToRedeem",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy",
ADD COLUMN     "point" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "PointSetting" DROP COLUMN "createdAt",
DROP COLUMN "pointType",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "PointAccumulationHistory";

-- AddForeignKey
ALTER TABLE "PointSetting" ADD CONSTRAINT "PointSetting_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAccumulation" ADD CONSTRAINT "PointAccumulation_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointRedemption" ADD CONSTRAINT "PointRedemption_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
