/*
  Warnings:

  - You are about to drop the column `actualQuantity` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `documentQuantity` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `InventoryTransaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InventoryTransaction" DROP CONSTRAINT "InventoryTransaction_productId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryTransaction" DROP CONSTRAINT "InventoryTransaction_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryTransaction" DROP CONSTRAINT "InventoryTransaction_unitId_fkey";

-- AlterTable
ALTER TABLE "InventoryTransaction" DROP COLUMN "actualQuantity",
DROP COLUMN "documentQuantity",
DROP COLUMN "price",
DROP COLUMN "productId",
DROP COLUMN "unitId",
ADD COLUMN     "isPublic" BOOLEAN DEFAULT true,
ALTER COLUMN "supplierId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "InventoryTransactionDetail" (
    "id" TEXT NOT NULL,
    "inventoryTransactionId" TEXT NOT NULL,
    "productId" TEXT,
    "unitId" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "documentQuantity" DOUBLE PRECISION,
    "actualQuantity" DOUBLE PRECISION NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,

    CONSTRAINT "InventoryTransactionDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionDetail" ADD CONSTRAINT "InventoryTransactionDetail_inventoryTransactionId_fkey" FOREIGN KEY ("inventoryTransactionId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionDetail" ADD CONSTRAINT "InventoryTransactionDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransactionDetail" ADD CONSTRAINT "InventoryTransactionDetail_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
