/*
  Warnings:

  - Changed the type of `point` on the `PointSetting` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PointSetting" DROP COLUMN "point",
ADD COLUMN     "point" DOUBLE PRECISION NOT NULL;
