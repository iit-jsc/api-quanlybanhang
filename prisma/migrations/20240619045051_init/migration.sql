/*
  Warnings:

  - You are about to drop the `ProductToProductType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductToProductType" DROP CONSTRAINT "ProductToProductType_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductToProductType" DROP CONSTRAINT "ProductToProductType_productTypeIdentifier_fkey";

-- DropTable
DROP TABLE "ProductToProductType";

-- CreateTable
CREATE TABLE "_ProductToProductType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToProductType_AB_unique" ON "_ProductToProductType"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToProductType_B_index" ON "_ProductToProductType"("B");

-- AddForeignKey
ALTER TABLE "_ProductToProductType" ADD CONSTRAINT "_ProductToProductType_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductType" ADD CONSTRAINT "_ProductToProductType_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
