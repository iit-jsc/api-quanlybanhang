/*
  Warnings:

  - You are about to drop the `AllowanceDeduction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AllowanceDeduction" DROP CONSTRAINT "AllowanceDeduction_branchId_fkey";

-- DropForeignKey
ALTER TABLE "AllowanceDeduction" DROP CONSTRAINT "AllowanceDeduction_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "AllowanceDeduction" DROP CONSTRAINT "AllowanceDeduction_updatedBy_fkey";

-- DropTable
DROP TABLE "AllowanceDeduction";

-- CreateTable
CREATE TABLE "AllowanceDeductionEmployee" (
    "id" TEXT NOT NULL,
    "allowanceDeductionSettingId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "AllowanceDeductionEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllowanceDeductionSetting" (
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

    CONSTRAINT "AllowanceDeductionSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AllowanceDeductionEmployee" ADD CONSTRAINT "AllowanceDeductionEmployee_allowanceDeductionSettingId_fkey" FOREIGN KEY ("allowanceDeductionSettingId") REFERENCES "AllowanceDeductionSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceDeductionEmployee" ADD CONSTRAINT "AllowanceDeductionEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceDeductionEmployee" ADD CONSTRAINT "AllowanceDeductionEmployee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceDeductionEmployee" ADD CONSTRAINT "AllowanceDeductionEmployee_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceDeductionEmployee" ADD CONSTRAINT "AllowanceDeductionEmployee_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceDeductionSetting" ADD CONSTRAINT "AllowanceDeductionSetting_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceDeductionSetting" ADD CONSTRAINT "AllowanceDeductionSetting_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceDeductionSetting" ADD CONSTRAINT "AllowanceDeductionSetting_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
