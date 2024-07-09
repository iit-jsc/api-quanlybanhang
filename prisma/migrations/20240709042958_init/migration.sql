/*
  Warnings:

  - You are about to drop the column `amountCustomer` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `isLimitCustomer` on the `Promotion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "amountCustomer",
DROP COLUMN "isLimitCustomer";
