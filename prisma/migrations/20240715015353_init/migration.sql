/*
  Warnings:

  - The primary key for the `AccountSocket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AccountSocket` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[socketId]` on the table `AccountSocket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AccountSocket" DROP CONSTRAINT "AccountSocket_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "AccountSocket_socketId_key" ON "AccountSocket"("socketId");
