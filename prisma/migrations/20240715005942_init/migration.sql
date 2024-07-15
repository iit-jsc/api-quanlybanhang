/*
  Warnings:

  - Added the required column `accountId` to the `AccountSocket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccountSocket" ADD COLUMN     "accountId" TEXT NOT NULL;
