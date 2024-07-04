/*
  Warnings:

  - You are about to drop the column `startDay` on the `DiscountIssue` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `DiscountIssue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DiscountIssue" DROP COLUMN "startDay",
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "isLimitCustomer" SET DEFAULT true,
ALTER COLUMN "otherDiscountApplied" SET DEFAULT false;
