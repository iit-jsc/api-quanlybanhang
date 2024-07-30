-- DropIndex
DROP INDEX "Product_slug_key";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "thumbnail" TEXT DEFAULT 'uploads/product.png';
