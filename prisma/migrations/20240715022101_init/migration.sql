/*
  Warnings:

  - The required column `id` was added to the `AccountSocket` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "AccountSocket_socketId_key";

-- AlterTable
ALTER TABLE "AccountSocket" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "AccountSocket_pkey" PRIMARY KEY ("id");
