-- DropIndex
DROP INDEX "Account_username_isPublic_key";

-- DropIndex
DROP INDEX "User_code_branchId_isPublic_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "type" INTEGER DEFAULT 3;
