/*
  Warnings:

  - You are about to drop the column `salarySettingId` on the `Allowance` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `DetailTableSalary` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `DetailTableSalary` table. All the data in the column will be lost.
  - Added the required column `employeeId` to the `DetailTableSalary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tableSalaryId` to the `DetailTableSalary` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Allowance" DROP CONSTRAINT "Allowance_salarySettingId_fkey";

-- AlterTable
ALTER TABLE "Allowance" DROP COLUMN "salarySettingId",
ADD COLUMN     "detailTableSalaryId" TEXT;

-- AlterTable
ALTER TABLE "DetailTableSalary" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "tableSalaryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AllowanceSetting" (
    "id" TEXT NOT NULL,
    "salarySettingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "AllowanceSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AllowanceSetting" ADD CONSTRAINT "AllowanceSetting_salarySettingId_fkey" FOREIGN KEY ("salarySettingId") REFERENCES "SalarySetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceSetting" ADD CONSTRAINT "AllowanceSetting_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTableSalary" ADD CONSTRAINT "DetailTableSalary_tableSalaryId_fkey" FOREIGN KEY ("tableSalaryId") REFERENCES "TableSalary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTableSalary" ADD CONSTRAINT "DetailTableSalary_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allowance" ADD CONSTRAINT "Allowance_detailTableSalaryId_fkey" FOREIGN KEY ("detailTableSalaryId") REFERENCES "DetailTableSalary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
