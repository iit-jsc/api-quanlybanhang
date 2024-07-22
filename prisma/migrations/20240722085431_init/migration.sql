/*
  Warnings:

  - Added the required column `updatedAt` to the `AllowanceDeduction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DetailTableSalary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EmployeeSalary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TableSalary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AllowanceDeduction" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DetailTableSalary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "EmployeeSalary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TableSalary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
