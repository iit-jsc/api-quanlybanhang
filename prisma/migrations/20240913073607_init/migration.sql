/*
  Warnings:

  - You are about to drop the column `discount` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `discount`,
    ADD COLUMN `discountIssue` JSON NULL;
