/*
  Warnings:

  - You are about to drop the column `limitPerCustomer` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `limitPerPromotion` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `noEndDate` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `nolimitPerPromotion` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `typePromotionValue` on the `Promotion` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Promotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isLimitCustomer` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "limitPerCustomer",
DROP COLUMN "limitPerPromotion",
DROP COLUMN "noEndDate",
DROP COLUMN "nolimitPerPromotion",
DROP COLUMN "typePromotionValue",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "amountCustomer" INTEGER,
ADD COLUMN     "isHasEndDate" BOOLEAN DEFAULT false,
ADD COLUMN     "isLimit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLimitCustomer" BOOLEAN NOT NULL,
ADD COLUMN     "typeValue" INTEGER,
ALTER COLUMN "value" DROP NOT NULL;
