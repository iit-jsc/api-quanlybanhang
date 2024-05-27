/*
  Warnings:

  - A unique constraint covering the columns `[code,branchId,isPublic]` on the table `Area` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Area_code_branchId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Area_code_branchId_isPublic_key" ON "Area"("code", "branchId", "isPublic");
