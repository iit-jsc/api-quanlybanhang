/*
  Warnings:

  - You are about to drop the column `noEndDay` on the `DiscountIssue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DiscountIssue" DROP COLUMN "noEndDay",
ADD COLUMN     "isNoEndDate" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Promotion" ALTER COLUMN "isNoEndDate" SET DEFAULT true;
