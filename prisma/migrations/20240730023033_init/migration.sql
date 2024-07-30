/*
  Warnings:

  - You are about to drop the column `createdAt` on the `DetailTableSalary` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `DetailTableSalary` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `DetailTableSalary` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `DetailTableSalary` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DetailTableSalary" DROP CONSTRAINT "DetailTableSalary_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "DetailTableSalary" DROP CONSTRAINT "DetailTableSalary_updatedBy_fkey";

-- AlterTable
ALTER TABLE "DetailTableSalary" DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy";
