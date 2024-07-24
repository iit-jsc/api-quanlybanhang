/*
  Warnings:

  - You are about to drop the column `userId` on the `CompensationSetting` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompensationSetting" DROP CONSTRAINT "CompensationSetting_userId_fkey";

-- AlterTable
ALTER TABLE "CompensationSetting" DROP COLUMN "userId";
