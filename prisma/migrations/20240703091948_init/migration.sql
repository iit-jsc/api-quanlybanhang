/*
  Warnings:

  - You are about to drop the column `createdBy` on the `PromotionCondition` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `PromotionCondition` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `PromotionProduct` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `PromotionProduct` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PromotionCondition" DROP CONSTRAINT "PromotionCondition_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PromotionCondition" DROP CONSTRAINT "PromotionCondition_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "PromotionProduct" DROP CONSTRAINT "PromotionProduct_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PromotionProduct" DROP CONSTRAINT "PromotionProduct_updatedBy_fkey";

-- AlterTable
ALTER TABLE "PromotionCondition" DROP COLUMN "createdBy",
DROP COLUMN "updatedBy";

-- AlterTable
ALTER TABLE "PromotionProduct" DROP COLUMN "createdBy",
DROP COLUMN "updatedBy";
