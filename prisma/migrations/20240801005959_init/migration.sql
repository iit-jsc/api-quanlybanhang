/*
  Warnings:

  - Added the required column `updatedAt` to the `FutureUsageSetting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FutureUsageSetting" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" TEXT;

-- AddForeignKey
ALTER TABLE "FutureUsageSetting" ADD CONSTRAINT "FutureUsageSetting_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
