/*
  Warnings:

  - You are about to drop the column `isPublic` on the `DetailTableSalary` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tableSalaryId,employeeId]` on the table `DetailTableSalary` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DetailTableSalary" DROP COLUMN "isPublic";

-- CreateIndex
CREATE UNIQUE INDEX "DetailTableSalary_tableSalaryId_employeeId_key" ON "DetailTableSalary"("tableSalaryId", "employeeId");
