/*
  Warnings:

  - You are about to drop the column `isPublic` on the `CompensationEmployee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[compensationSettingId,employeeId]` on the table `CompensationEmployee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CompensationEmployee" DROP COLUMN "isPublic";

-- CreateIndex
CREATE UNIQUE INDEX "CompensationEmployee_compensationSettingId_employeeId_key" ON "CompensationEmployee"("compensationSettingId", "employeeId");
