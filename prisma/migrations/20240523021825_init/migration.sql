/*
  Warnings:

  - You are about to drop the column `type` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "type",
ADD COLUMN     "isInitialStock" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "status" SET DEFAULT 1;
