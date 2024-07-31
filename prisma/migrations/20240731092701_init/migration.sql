-- CreateTable
CREATE TABLE "FutureUsageSetting" (
    "shopId" TEXT NOT NULL,
    "futureShopCode" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "FutureUsageSetting_shopId_futureShopCode_key" ON "FutureUsageSetting"("shopId", "futureShopCode");
