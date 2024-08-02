-- AlterTable
ALTER TABLE "AuthToken" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "userAgent" TEXT;
