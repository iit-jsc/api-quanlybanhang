/*
  Warnings:

  - You are about to drop the `AllowanceDeductionEmployee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AllowanceDeductionSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AllowanceDeductionEmployee" DROP CONSTRAINT "AllowanceDeductionEmployee_allowanceDeductionSettingId_fkey";

-- DropForeignKey
ALTER TABLE "AllowanceDeductionEmployee" DROP CONSTRAINT "AllowanceDeductionEmployee_branchId_fkey";

-- DropForeignKey
ALTER TABLE "AllowanceDeductionEmployee" DROP CONSTRAINT "AllowanceDeductionEmployee_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "AllowanceDeductionEmployee" DROP CONSTRAINT "AllowanceDeductionEmployee_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "AllowanceDeductionEmployee" DROP CONSTRAINT "AllowanceDeductionEmployee_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "AllowanceDeductionSetting" DROP CONSTRAINT "AllowanceDeductionSetting_branchId_fkey";

-- DropForeignKey
ALTER TABLE "AllowanceDeductionSetting" DROP CONSTRAINT "AllowanceDeductionSetting_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "AllowanceDeductionSetting" DROP CONSTRAINT "AllowanceDeductionSetting_updatedBy_fkey";

-- DropTable
DROP TABLE "AllowanceDeductionEmployee";

-- DropTable
DROP TABLE "AllowanceDeductionSetting";

-- CreateTable
CREATE TABLE "CompensationEmployee" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "compensationSettingId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "CompensationEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompensationSetting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" INTEGER NOT NULL,
    "defaultValue" DOUBLE PRECISION NOT NULL,
    "branchId" TEXT NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "userId" TEXT,

    CONSTRAINT "CompensationSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompensationEmployee" ADD CONSTRAINT "CompensationEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationEmployee" ADD CONSTRAINT "CompensationEmployee_compensationSettingId_fkey" FOREIGN KEY ("compensationSettingId") REFERENCES "CompensationSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationEmployee" ADD CONSTRAINT "CompensationEmployee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationEmployee" ADD CONSTRAINT "CompensationEmployee_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationEmployee" ADD CONSTRAINT "CompensationEmployee_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationSetting" ADD CONSTRAINT "CompensationSetting_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationSetting" ADD CONSTRAINT "CompensationSetting_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationSetting" ADD CONSTRAINT "CompensationSetting_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationSetting" ADD CONSTRAINT "CompensationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
