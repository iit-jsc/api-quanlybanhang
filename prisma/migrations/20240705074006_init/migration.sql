/*
  Warnings:

  - Added the required column `type` to the `PointRedemption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PointRedemption" ADD COLUMN     "type" INTEGER NOT NULL;
