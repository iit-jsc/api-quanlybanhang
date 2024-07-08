/*
  Warnings:

  - You are about to drop the column `orderId` on the `Promotion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "promotionId" TEXT;

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "orderId";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
