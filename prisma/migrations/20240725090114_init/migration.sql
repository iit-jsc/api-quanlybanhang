/*
  Warnings:

  - You are about to drop the column `type` on the `TableSalary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TableSalary" DROP COLUMN "type",
ADD COLUMN     "isFulltime" BOOLEAN NOT NULL DEFAULT true;
