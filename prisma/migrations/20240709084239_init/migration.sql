/*
  Warnings:

  - You are about to drop the column `amountCustomer` on the `DiscountIssue` table. All the data in the column will be lost.
  - You are about to drop the column `isLimitCustomer` on the `DiscountIssue` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DiscountIssue" DROP COLUMN "amountCustomer",
DROP COLUMN "isLimitCustomer";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "discount",
ADD COLUMN     "discountValue" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "promotionValue" DOUBLE PRECISION DEFAULT 0;
