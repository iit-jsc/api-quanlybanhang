-- AlterTable
ALTER TABLE "PrintTemplate" ALTER COLUMN "isDefault" DROP NOT NULL,
ALTER COLUMN "isDefault" SET DEFAULT false;
