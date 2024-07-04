/*
  Warnings:

  - The primary key for the `BusinessType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `BusinessType` table. All the data in the column will be lost.
  - You are about to drop the column `businessTypeId` on the `Shop` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `BusinessType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `businessTypeCode` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Shop" DROP CONSTRAINT "Shop_businessTypeId_fkey";

-- AlterTable
ALTER TABLE "BusinessType" DROP CONSTRAINT "BusinessType_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "BusinessType_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "businessTypeId",
ADD COLUMN     "businessTypeCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BusinessType_code_key" ON "BusinessType"("code");

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_businessTypeCode_fkey" FOREIGN KEY ("businessTypeCode") REFERENCES "BusinessType"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
