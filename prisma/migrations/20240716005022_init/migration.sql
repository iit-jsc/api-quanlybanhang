/*
  Warnings:

  - You are about to drop the column `branchId` on the `PrintTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PrintTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `PrintTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `PrintTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `PrintTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isShopTemplate` on the `PrintTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `PrintTemplate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PrintTemplate" DROP CONSTRAINT "PrintTemplate_branchId_fkey";

-- AlterTable
ALTER TABLE "PrintTemplate" DROP COLUMN "branchId",
DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "description",
DROP COLUMN "isPublic",
DROP COLUMN "isShopTemplate",
DROP COLUMN "name",
ADD COLUMN     "shopId" TEXT;

-- AddForeignKey
ALTER TABLE "PrintTemplate" ADD CONSTRAINT "PrintTemplate_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
