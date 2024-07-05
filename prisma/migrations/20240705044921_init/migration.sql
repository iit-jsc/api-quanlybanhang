/*
  Warnings:

  - Added the required column `active` to the `PointSetting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PointSetting" ADD COLUMN     "active" BOOLEAN NOT NULL;
