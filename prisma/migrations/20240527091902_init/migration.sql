/*
  Warnings:

  - You are about to drop the `_ProductToTopping` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductToTopping" DROP CONSTRAINT "_ProductToTopping_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToTopping" DROP CONSTRAINT "_ProductToTopping_B_fkey";

-- DropTable
DROP TABLE "_ProductToTopping";
