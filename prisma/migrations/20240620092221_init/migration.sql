/*
  Warnings:

  - You are about to drop the column `identifier` on the `ProductType` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ProductType_identifier_branchId_isPublic_key";

-- AlterTable
ALTER TABLE "ProductType" DROP COLUMN "identifier";

-- AddForeignKey
ALTER TABLE "ProductType" ADD CONSTRAINT "ProductType_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductType" ADD CONSTRAINT "ProductType_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
