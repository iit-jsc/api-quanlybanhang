/*
  Warnings:

  - You are about to drop the `Coupon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CouponConditionProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CouponProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_branchId_fkey";

-- DropForeignKey
ALTER TABLE "CouponConditionProduct" DROP CONSTRAINT "CouponConditionProduct_branchId_fkey";

-- DropForeignKey
ALTER TABLE "CouponConditionProduct" DROP CONSTRAINT "CouponConditionProduct_couponId_fkey";

-- DropForeignKey
ALTER TABLE "CouponConditionProduct" DROP CONSTRAINT "CouponConditionProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "CouponProduct" DROP CONSTRAINT "CouponProduct_branchId_fkey";

-- DropForeignKey
ALTER TABLE "CouponProduct" DROP CONSTRAINT "CouponProduct_couponId_fkey";

-- DropForeignKey
ALTER TABLE "CouponProduct" DROP CONSTRAINT "CouponProduct_productId_fkey";

-- DropTable
DROP TABLE "Coupon";

-- DropTable
DROP TABLE "CouponConditionProduct";

-- DropTable
DROP TABLE "CouponProduct";

-- CreateTable
CREATE TABLE "Promotion" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "noEndDate" BOOLEAN,
    "limitPerPromotion" INTEGER NOT NULL,
    "limitPerCustomer" INTEGER,
    "nolimitPerPromotion" BOOLEAN NOT NULL,
    "description" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "typePromotionValue" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionCondition" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionProduct" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "productId" INTEGER,
    "amount" INTEGER NOT NULL,
    "productName" TEXT,
    "photoURL" TEXT,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionCondition" ADD CONSTRAINT "PromotionCondition_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionCondition" ADD CONSTRAINT "PromotionCondition_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionCondition" ADD CONSTRAINT "PromotionCondition_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionProduct" ADD CONSTRAINT "PromotionProduct_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionProduct" ADD CONSTRAINT "PromotionProduct_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionProduct" ADD CONSTRAINT "PromotionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
