/*
  Warnings:

  - You are about to drop the column `type` on the `EmployeeSalary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmployeeSalary" DROP COLUMN "type",
ADD COLUMN     "isFulltime" BOOLEAN NOT NULL DEFAULT true;
