-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_supplierTypeId_fkey";

-- AlterTable
ALTER TABLE "Supplier" ALTER COLUMN "supplierTypeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_supplierTypeId_fkey" FOREIGN KEY ("supplierTypeId") REFERENCES "SupplierType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
