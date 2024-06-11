/*
  Warnings:

  - You are about to drop the column `branchId` on the `OrderRating` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `OrderRating` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OrderRating` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `OrderRating` table. All the data in the column will be lost.
  - You are about to drop the `StaffRating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderRating" DROP CONSTRAINT "OrderRating_branchId_fkey";

-- DropForeignKey
ALTER TABLE "StaffRating" DROP CONSTRAINT "StaffRating_branchId_fkey";

-- DropForeignKey
ALTER TABLE "StaffRating" DROP CONSTRAINT "StaffRating_userId_fkey";

-- AlterTable
ALTER TABLE "OrderRating" DROP COLUMN "branchId",
DROP COLUMN "createdBy",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy";

-- DropTable
DROP TABLE "StaffRating";
