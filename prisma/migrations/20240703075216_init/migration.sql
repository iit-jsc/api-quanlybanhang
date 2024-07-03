/*
  Warnings:

  - You are about to drop the column `productName` on the `PromotionProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PromotionProduct" DROP COLUMN "productName",
ADD COLUMN     "name" TEXT;
