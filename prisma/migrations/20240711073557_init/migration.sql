/*
  Warnings:

  - You are about to drop the column `accountId` on the `InventoryTransactionDetail` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `InventoryTransactionDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryTransactionDetail" DROP COLUMN "accountId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
