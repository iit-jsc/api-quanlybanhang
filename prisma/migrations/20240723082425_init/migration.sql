/*
  Warnings:

  - Added the required column `defaultValue` to the `AllowanceDeduction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AllowanceDeduction" ADD COLUMN     "defaultValue" DOUBLE PRECISION NOT NULL;
