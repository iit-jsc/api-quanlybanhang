-- CreateTable
CREATE TABLE "AccountSocket" (
    "id" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountSocket_pkey" PRIMARY KEY ("id")
);
