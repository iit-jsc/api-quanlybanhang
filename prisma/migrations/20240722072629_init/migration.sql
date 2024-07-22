/*
  Warnings:

  - You are about to drop the column `salarySettingId` on the `TableSalary` table. All the data in the column will be lost.
  - You are about to drop the `Allowance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AllowanceSetting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalarySetting` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `TableSalary` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Allowance" DROP CONSTRAINT "Allowance_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Allowance" DROP CONSTRAINT "Allowance_detailTableSalaryId_fkey";

-- DropForeignKey
ALTER TABLE "AllowanceSetting" DROP CONSTRAINT "AllowanceSetting_branchId_fkey";

-- DropForeignKey
ALTER TABLE "AllowanceSetting" DROP CONSTRAINT "AllowanceSetting_salarySettingId_fkey";

-- DropForeignKey
ALTER TABLE "DetailTableSalary" DROP CONSTRAINT "DetailTableSalary_branchId_fkey";

-- DropForeignKey
ALTER TABLE "SalarySetting" DROP CONSTRAINT "SalarySetting_branchId_fkey";

-- DropForeignKey
ALTER TABLE "SalarySetting" DROP CONSTRAINT "SalarySetting_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "SalarySetting" DROP CONSTRAINT "SalarySetting_employeeGroupId_fkey";

-- DropForeignKey
ALTER TABLE "SalarySetting" DROP CONSTRAINT "SalarySetting_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "TableSalary" DROP CONSTRAINT "TableSalary_salarySettingId_fkey";

-- AlterTable
ALTER TABLE "DetailTableSalary" ADD COLUMN     "allowanceValue" JSONB,
ADD COLUMN     "deductionValue" JSONB,
ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EmployeeGroup" ADD COLUMN     "salarySettingId" TEXT;

-- AlterTable
ALTER TABLE "TableSalary" DROP COLUMN "salarySettingId",
ADD COLUMN     "allowanceLabel" JSONB,
ADD COLUMN     "deductionLabel" JSONB,
ADD COLUMN     "type" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Allowance";

-- DropTable
DROP TABLE "AllowanceSetting";

-- DropTable
DROP TABLE "SalarySetting";

-- CreateTable
CREATE TABLE "AllowanceDeduction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" INTEGER NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "AllowanceDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSalary" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "salaryType" INTEGER,
    "branchId" TEXT NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "EmployeeSalary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DetailTableSalary" ADD CONSTRAINT "DetailTableSalary_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceDeduction" ADD CONSTRAINT "AllowanceDeduction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceDeduction" ADD CONSTRAINT "AllowanceDeduction_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceDeduction" ADD CONSTRAINT "AllowanceDeduction_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalary" ADD CONSTRAINT "EmployeeSalary_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalary" ADD CONSTRAINT "EmployeeSalary_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalary" ADD CONSTRAINT "EmployeeSalary_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalary" ADD CONSTRAINT "EmployeeSalary_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
