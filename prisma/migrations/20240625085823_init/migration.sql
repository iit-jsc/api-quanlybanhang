/*
  Warnings:

  - You are about to drop the `_BranchToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code,branchId,isPublic]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_BranchToUser" DROP CONSTRAINT "_BranchToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_BranchToUser" DROP CONSTRAINT "_BranchToUser_B_fkey";

-- DropIndex
DROP INDEX "Area_code_branchId_isPublic_key";

-- DropIndex
DROP INDEX "Customer_code_shopId_isPublic_key";

-- DropIndex
DROP INDEX "Customer_phone_shopId_isPublic_key";

-- DropIndex
DROP INDEX "Order_code_branchId_key";

-- DropIndex
DROP INDEX "Product_code_branchId_isPublic_key";

-- DropIndex
DROP INDEX "Product_slug_branchId_isPublic_key";

-- DropIndex
DROP INDEX "ProductType_slug_branchId_isPublic_key";

-- DropIndex
DROP INDEX "Table_code_branchId_isPublic_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "branchId" INTEGER;

-- DropTable
DROP TABLE "_BranchToUser";

-- CreateIndex
CREATE UNIQUE INDEX "User_code_branchId_isPublic_key" ON "User"("code", "branchId", "isPublic");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
