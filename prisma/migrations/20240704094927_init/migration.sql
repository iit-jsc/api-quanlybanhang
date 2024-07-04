/*
  Warnings:

  - You are about to drop the column `endDay` on the `DiscountIssue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DiscountIssue" DROP COLUMN "endDay",
ADD COLUMN     "endDate" TIMESTAMP(3);
