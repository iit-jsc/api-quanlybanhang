/*
  Warnings:

  - You are about to drop the column `pointValue` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "pointValue",
ADD COLUMN     "convertedPointValue" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "usedPoint" DOUBLE PRECISION DEFAULT 0;
