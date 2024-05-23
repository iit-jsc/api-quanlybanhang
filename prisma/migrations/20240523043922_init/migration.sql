/*
  Warnings:

  - You are about to drop the column `photoURL` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "photoURL",
ADD COLUMN     "photoURLs" JSONB;
