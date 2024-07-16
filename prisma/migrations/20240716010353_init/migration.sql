/*
  Warnings:

  - Added the required column `isDefault` to the `PrintTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PrintTemplate" ADD COLUMN     "isDefault" BOOLEAN NOT NULL;
