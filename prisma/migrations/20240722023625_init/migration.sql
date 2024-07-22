/*
  Warnings:

  - Added the required column `salarySettingId` to the `TableSalary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TableSalary" ADD COLUMN     "salarySettingId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TableSalary" ADD CONSTRAINT "TableSalary_salarySettingId_fkey" FOREIGN KEY ("salarySettingId") REFERENCES "SalarySetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
