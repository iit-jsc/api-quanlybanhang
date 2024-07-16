/*
  Warnings:

  - You are about to drop the column `createdBy` on the `PointHistory` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `PointHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PointHistory" DROP CONSTRAINT "PointHistory_createdBy_fkey";

-- AlterTable
ALTER TABLE "PointHistory" DROP COLUMN "createdBy",
DROP COLUMN "isPublic";
