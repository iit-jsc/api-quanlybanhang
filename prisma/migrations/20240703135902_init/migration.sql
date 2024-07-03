/*
  Warnings:

  - You are about to drop the column `applyAllBranch` on the `DiscountIssue` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `DiscountIssue` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `DiscountIssue` table. All the data in the column will be lost.
  - You are about to drop the column `identifier` on the `DiscountIssue` table. All the data in the column will be lost.
  - You are about to drop the column `limitPerCode` on the `DiscountIssue` table. All the data in the column will be lost.
  - You are about to drop the column `limitPerCustomer` on the `DiscountIssue` table. All the data in the column will be lost.
  - You are about to drop the column `noLimitCustomer` on the `DiscountIssue` table. All the data in the column will be lost.
  - You are about to drop the column `noLimitPerCode` on the `DiscountIssue` table. All the data in the column will be lost.
  - Added the required column `amount` to the `DiscountIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountCustomer` to the `DiscountIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isLimit` to the `DiscountIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isLimitCustomer` to the `DiscountIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `DiscountIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `DiscountIssue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DiscountIssue" DROP COLUMN "applyAllBranch",
DROP COLUMN "discountType",
DROP COLUMN "discountValue",
DROP COLUMN "identifier",
DROP COLUMN "limitPerCode",
DROP COLUMN "limitPerCustomer",
DROP COLUMN "noLimitCustomer",
DROP COLUMN "noLimitPerCode",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "amountCustomer" INTEGER NOT NULL,
ADD COLUMN     "isLimit" BOOLEAN NOT NULL,
ADD COLUMN     "isLimitCustomer" BOOLEAN NOT NULL,
ADD COLUMN     "maxValue" DOUBLE PRECISION,
ADD COLUMN     "type" INTEGER NOT NULL,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "DiscountIssue" ADD CONSTRAINT "DiscountIssue_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountIssue" ADD CONSTRAINT "DiscountIssue_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
