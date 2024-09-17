/*
  Warnings:

  - Added the required column `updatedAt` to the `ProductOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProductOptionGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `productoption` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `price` DOUBLE NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `productoptiongroup` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
