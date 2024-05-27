/*
  Warnings:

  - You are about to drop the column `photoURL` on the `Topping` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Topping" DROP COLUMN "photoURL",
ADD COLUMN     "photoURLs" JSONB;
