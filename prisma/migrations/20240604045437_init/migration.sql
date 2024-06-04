/*
  Warnings:

  - You are about to drop the column `createdBy` on the `OrderDetail` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `OrderDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderDetail" DROP COLUMN "createdBy",
DROP COLUMN "updatedBy";
