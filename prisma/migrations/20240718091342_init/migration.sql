/*
  Warnings:

  - Made the column `startTime` on table `WorkShift` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endTime` on table `WorkShift` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WorkShift" ALTER COLUMN "startTime" SET NOT NULL,
ALTER COLUMN "endTime" SET NOT NULL;
