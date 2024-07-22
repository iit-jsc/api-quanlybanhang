-- AlterTable
ALTER TABLE "AllowanceDeduction" ADD COLUMN     "isPublic" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "DetailTableSalary" ADD COLUMN     "isPublic" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "EmployeeSalary" ADD COLUMN     "isPublic" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "TableSalary" ADD COLUMN     "isConfirm" BOOLEAN DEFAULT false,
ADD COLUMN     "isPublic" BOOLEAN DEFAULT true;
