/*
  Warnings:

  - You are about to drop the column `isFinish` on the `OrderDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderDetail" DROP COLUMN "isFinish",
ADD COLUMN     "status" INTEGER DEFAULT 1;
