/*
  Warnings:

  - The `startTime` column on the `WorkShift` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endTime` column on the `WorkShift` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Salary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimeSheet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Salary" DROP CONSTRAINT "Salary_branchId_fkey";

-- DropForeignKey
ALTER TABLE "TimeSheet" DROP CONSTRAINT "TimeSheet_branchId_fkey";

-- DropForeignKey
ALTER TABLE "TimeSheet" DROP CONSTRAINT "TimeSheet_employeeId_fkey";

-- AlterTable
ALTER TABLE "WorkShift" ADD COLUMN     "isNotLimitEmployee" BOOLEAN DEFAULT true,
ADD COLUMN     "limitEmployee" INTEGER,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIME(0),
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIME(0);

-- DropTable
DROP TABLE "Salary";

-- DropTable
DROP TABLE "TimeSheet";

-- CreateTable
CREATE TABLE "SalarySetting" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "type" INTEGER NOT NULL,
    "employeeGroupId" TEXT NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalarySetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableSalary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "TableSalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailTableSalary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "DetailTableSalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allowance" (
    "id" TEXT NOT NULL,
    "salarySettingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "Allowance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalarySetting_employeeGroupId_key" ON "SalarySetting"("employeeGroupId");

-- AddForeignKey
ALTER TABLE "WorkShift" ADD CONSTRAINT "WorkShift_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkShift" ADD CONSTRAINT "WorkShift_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSchedule" ADD CONSTRAINT "EmployeeSchedule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSchedule" ADD CONSTRAINT "EmployeeSchedule_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalarySetting" ADD CONSTRAINT "SalarySetting_employeeGroupId_fkey" FOREIGN KEY ("employeeGroupId") REFERENCES "EmployeeGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalarySetting" ADD CONSTRAINT "SalarySetting_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalarySetting" ADD CONSTRAINT "SalarySetting_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalarySetting" ADD CONSTRAINT "SalarySetting_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableSalary" ADD CONSTRAINT "TableSalary_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableSalary" ADD CONSTRAINT "TableSalary_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableSalary" ADD CONSTRAINT "TableSalary_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTableSalary" ADD CONSTRAINT "DetailTableSalary_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTableSalary" ADD CONSTRAINT "DetailTableSalary_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTableSalary" ADD CONSTRAINT "DetailTableSalary_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allowance" ADD CONSTRAINT "Allowance_salarySettingId_fkey" FOREIGN KEY ("salarySettingId") REFERENCES "SalarySetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allowance" ADD CONSTRAINT "Allowance_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
