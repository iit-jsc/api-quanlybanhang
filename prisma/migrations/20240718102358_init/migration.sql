/*
  Warnings:

  - You are about to drop the column `isCombo` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `ComboProductItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ComboProductItem" DROP CONSTRAINT "ComboProductItem_branchId_fkey";

-- DropForeignKey
ALTER TABLE "ComboProductItem" DROP CONSTRAINT "ComboProductItem_productId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isCombo";

-- DropTable
DROP TABLE "ComboProductItem";
