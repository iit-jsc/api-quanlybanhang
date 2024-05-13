/*
  Warnings:

  - You are about to drop the column `identifier` on the `CurrencyUnit` table. All the data in the column will be lost.
  - You are about to drop the column `identifier` on the `MeasurementUnit` table. All the data in the column will be lost.
  - You are about to drop the column `identifier` on the `PrintTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CurrencyUnit" DROP COLUMN "identifier";

-- AlterTable
ALTER TABLE "MeasurementUnit" DROP COLUMN "identifier";

-- AlterTable
ALTER TABLE "PrintTemplate" DROP COLUMN "identifier";
