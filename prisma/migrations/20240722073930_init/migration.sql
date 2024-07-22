/*
  Warnings:

  - Added the required column `workDay` to the `DetailTableSalary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DetailTableSalary" ADD COLUMN     "baseSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "salaryType" INTEGER,
ADD COLUMN     "workDay" DOUBLE PRECISION NOT NULL;
