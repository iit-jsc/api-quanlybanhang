/*
  Warnings:

  - A unique constraint covering the columns `[code,branchId]` on the table `Table` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Table_code_branchId_key" ON "Table"("code", "branchId");
