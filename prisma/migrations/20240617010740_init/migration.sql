-- CreateTable
CREATE TABLE "GroupRole" (
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "GroupRole_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "groupCode" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN DEFAULT true,

    CONSTRAINT "BusinessType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "type" INTEGER NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "photoURL" TEXT,
    "address" TEXT,
    "cardId" TEXT,
    "cardDate" TIMESTAMP(3),
    "cardAddress" TEXT,
    "birthday" TIMESTAMP(3),
    "sex" INTEGER,
    "startDate" TIMESTAMP(3),
    "employeeGroupId" INTEGER,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "businessTypeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "photoURL" TEXT,
    "domain" TEXT,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintTemplate" (
    "id" SERIAL NOT NULL,
    "type" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT,
    "description" TEXT,
    "isShopTemplate" BOOLEAN NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyUnit" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "branchId" INTEGER,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrencyUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementUnit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeasurementUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "tableName" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "affectedRecordId" INTEGER,
    "branchId" INTEGER NOT NULL,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductType" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "branchId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherAttributePattern" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "productTypeId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtherAttributePattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topping" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photoURLs" JSONB,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "branchId" INTEGER NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "branchId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "productTypeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "photoURLs" JSONB,
    "otherAttributes" JSONB,
    "isCombo" BOOLEAN NOT NULL DEFAULT false,
    "status" INTEGER DEFAULT 1,
    "isInitialStock" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboProductItem" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "amount" BOOLEAN NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComboProductItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "capitalPrice" DOUBLE PRECISION,
    "totalQuantity" DOUBLE PRECISION,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discount" DOUBLE PRECISION,
    "discountType" INTEGER,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "CustomerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "customerTypeId" INTEGER,
    "code" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "representativeName" TEXT,
    "representativePhone" TEXT,
    "birthDay" TIMESTAMP(3),
    "endow" INTEGER DEFAULT 1,
    "discount" DOUBLE PRECISION,
    "discountType" INTEGER,
    "sex" INTEGER,
    "fax" TEXT,
    "tax" TEXT,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierType" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "supplierName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "representativeName" TEXT,
    "representativePhone" TEXT,
    "supplierTypeId" INTEGER NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "type" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "noEndDate" BOOLEAN,
    "discountAllProduct" BOOLEAN NOT NULL,
    "unlimitedNumber" BOOLEAN NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "limitPerCoupon" INTEGER NOT NULL,
    "limitPerCustomer" INTEGER,
    "nolimitPerCoupon" BOOLEAN NOT NULL,
    "noEndDate" BOOLEAN,
    "description" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "typeCouponValue" INTEGER NOT NULL,
    "typeCoupon" INTEGER NOT NULL,
    "applyAllBranch" BOOLEAN NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponConditionProduct" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "couponId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponConditionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponProduct" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "couponId" INTEGER NOT NULL,
    "productId" INTEGER,
    "amount" INTEGER NOT NULL,
    "productName" TEXT,
    "photoURL" TEXT,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "customerId" INTEGER,
    "code" TEXT NOT NULL,
    "cancelReason" TEXT,
    "cancelDate" TIMESTAMP(3),
    "transactionId" TEXT,
    "note" TEXT,
    "orderType" INTEGER NOT NULL,
    "paymentMethod" INTEGER,
    "isPaid" BOOLEAN DEFAULT false,
    "isSave" BOOLEAN DEFAULT false,
    "orderStatus" INTEGER NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDetail" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "orderId" INTEGER,
    "productId" INTEGER NOT NULL,
    "toppingId" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "status" INTEGER DEFAULT 1,
    "productPrice" DOUBLE PRECISION NOT NULL,
    "toppingPrice" DOUBLE PRECISION DEFAULT 0,
    "isPublic" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tableId" INTEGER,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableTransaction" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "tableId" INTEGER NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TableTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "photoURL" TEXT,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "photoURL" TEXT,
    "description" TEXT,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountIssue" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "branchId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "discountType" INTEGER NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "startDay" TIMESTAMP(3) NOT NULL,
    "endDay" TIMESTAMP(3),
    "noEndDay" BOOLEAN,
    "description" TEXT,
    "limitPerCode" INTEGER NOT NULL,
    "limitPerCustomer" INTEGER NOT NULL,
    "noLimitPerCode" BOOLEAN NOT NULL,
    "noLimitCustomer" BOOLEAN NOT NULL,
    "applyAllBranch" BOOLEAN NOT NULL,
    "otherDiscountApplied" BOOLEAN NOT NULL,
    "minTotalOrder" DOUBLE PRECISION,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "discountIssueId" INTEGER NOT NULL,
    "quantityUsed" INTEGER NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointSetting" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "point" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "pointType" INTEGER,
    "isPublic" BOOLEAN DEFAULT true,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointAccumulation" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "point" DOUBLE PRECISION NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointAccumulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointRedemption" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "pointToRedeem" DOUBLE PRECISION NOT NULL,
    "amountRedeemed" DOUBLE PRECISION NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointAccumulationHistory" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "point" DOUBLE PRECISION,
    "orderId" INTEGER NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointAccumulationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerRequest" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "requestType" INTEGER NOT NULL,
    "requestDetail" TEXT NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderRating" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "ratingValue" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "photoURLs" JSONB,
    "isPublic" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "photoURL" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "status" INTEGER,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkShift" (
    "id" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSchedule" (
    "id" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "workShiftId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSheet" (
    "id" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "date" TIMESTAMP(3),
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salary" (
    "id" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "weeklyRate" DOUBLE PRECISION NOT NULL,
    "monthlyRate" DOUBLE PRECISION NOT NULL,
    "isPublic" BOOLEAN DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneVerification" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccountToPermission" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DealToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DealToOrder" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_OrderDetailToTableTransaction" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BranchToPrintTemplate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BranchToMeasurementUnit" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BranchToPermission" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BranchToEmployeeGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BranchToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_code_key" ON "Shop"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductType_identifier_branchId_isPublic_key" ON "ProductType"("identifier", "branchId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_branchId_isPublic_key" ON "Product"("sku", "branchId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_branchId_isPublic_key" ON "Product"("code", "branchId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Product_identifier_branchId_isPublic_key" ON "Product"("identifier", "branchId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_shopId_isPublic_key" ON "Customer"("code", "shopId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_shopId_isPublic_key" ON "Customer"("phone", "shopId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Order_code_branchId_key" ON "Order"("code", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Area_code_branchId_isPublic_key" ON "Area"("code", "branchId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Table_code_branchId_isPublic_key" ON "Table"("code", "branchId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccountToPermission_AB_unique" ON "_AccountToPermission"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountToPermission_B_index" ON "_AccountToPermission"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DealToProduct_AB_unique" ON "_DealToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_DealToProduct_B_index" ON "_DealToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DealToOrder_AB_unique" ON "_DealToOrder"("A", "B");

-- CreateIndex
CREATE INDEX "_DealToOrder_B_index" ON "_DealToOrder"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrderDetailToTableTransaction_AB_unique" ON "_OrderDetailToTableTransaction"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderDetailToTableTransaction_B_index" ON "_OrderDetailToTableTransaction"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BranchToPrintTemplate_AB_unique" ON "_BranchToPrintTemplate"("A", "B");

-- CreateIndex
CREATE INDEX "_BranchToPrintTemplate_B_index" ON "_BranchToPrintTemplate"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BranchToMeasurementUnit_AB_unique" ON "_BranchToMeasurementUnit"("A", "B");

-- CreateIndex
CREATE INDEX "_BranchToMeasurementUnit_B_index" ON "_BranchToMeasurementUnit"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BranchToPermission_AB_unique" ON "_BranchToPermission"("A", "B");

-- CreateIndex
CREATE INDEX "_BranchToPermission_B_index" ON "_BranchToPermission"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BranchToEmployeeGroup_AB_unique" ON "_BranchToEmployeeGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_BranchToEmployeeGroup_B_index" ON "_BranchToEmployeeGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BranchToUser_AB_unique" ON "_BranchToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BranchToUser_B_index" ON "_BranchToUser"("B");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_groupCode_fkey" FOREIGN KEY ("groupCode") REFERENCES "GroupRole"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeGroupId_fkey" FOREIGN KEY ("employeeGroupId") REFERENCES "EmployeeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrencyUnit" ADD CONSTRAINT "CurrencyUnit_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductType" ADD CONSTRAINT "ProductType_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherAttributePattern" ADD CONSTRAINT "OtherAttributePattern_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherAttributePattern" ADD CONSTRAINT "OtherAttributePattern_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topping" ADD CONSTRAINT "Topping_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboProductItem" ADD CONSTRAINT "ComboProductItem_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboProductItem" ADD CONSTRAINT "ComboProductItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerType" ADD CONSTRAINT "CustomerType_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_customerTypeId_fkey" FOREIGN KEY ("customerTypeId") REFERENCES "CustomerType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierType" ADD CONSTRAINT "SupplierType_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_supplierTypeId_fkey" FOREIGN KEY ("supplierTypeId") REFERENCES "SupplierType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponConditionProduct" ADD CONSTRAINT "CouponConditionProduct_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponConditionProduct" ADD CONSTRAINT "CouponConditionProduct_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponConditionProduct" ADD CONSTRAINT "CouponConditionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponProduct" ADD CONSTRAINT "CouponProduct_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponProduct" ADD CONSTRAINT "CouponProduct_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponProduct" ADD CONSTRAINT "CouponProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_toppingId_fkey" FOREIGN KEY ("toppingId") REFERENCES "Topping"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableTransaction" ADD CONSTRAINT "TableTransaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableTransaction" ADD CONSTRAINT "TableTransaction_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountIssue" ADD CONSTRAINT "DiscountIssue_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_discountIssueId_fkey" FOREIGN KEY ("discountIssueId") REFERENCES "DiscountIssue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointSetting" ADD CONSTRAINT "PointSetting_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAccumulation" ADD CONSTRAINT "PointAccumulation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAccumulation" ADD CONSTRAINT "PointAccumulation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointRedemption" ADD CONSTRAINT "PointRedemption_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointRedemption" ADD CONSTRAINT "PointRedemption_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointRedemption" ADD CONSTRAINT "PointRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAccumulationHistory" ADD CONSTRAINT "PointAccumulationHistory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAccumulationHistory" ADD CONSTRAINT "PointAccumulationHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRequest" ADD CONSTRAINT "CustomerRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRequest" ADD CONSTRAINT "CustomerRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderRating" ADD CONSTRAINT "OrderRating_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkShift" ADD CONSTRAINT "WorkShift_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSchedule" ADD CONSTRAINT "EmployeeSchedule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSchedule" ADD CONSTRAINT "EmployeeSchedule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSchedule" ADD CONSTRAINT "EmployeeSchedule_workShiftId_fkey" FOREIGN KEY ("workShiftId") REFERENCES "WorkShift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheet" ADD CONSTRAINT "TimeSheet_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheet" ADD CONSTRAINT "TimeSheet_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToPermission" ADD CONSTRAINT "_AccountToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToPermission" ADD CONSTRAINT "_AccountToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DealToProduct" ADD CONSTRAINT "_DealToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DealToProduct" ADD CONSTRAINT "_DealToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DealToOrder" ADD CONSTRAINT "_DealToOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DealToOrder" ADD CONSTRAINT "_DealToOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderDetailToTableTransaction" ADD CONSTRAINT "_OrderDetailToTableTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "OrderDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderDetailToTableTransaction" ADD CONSTRAINT "_OrderDetailToTableTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "TableTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToPrintTemplate" ADD CONSTRAINT "_BranchToPrintTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToPrintTemplate" ADD CONSTRAINT "_BranchToPrintTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "PrintTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToMeasurementUnit" ADD CONSTRAINT "_BranchToMeasurementUnit_A_fkey" FOREIGN KEY ("A") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToMeasurementUnit" ADD CONSTRAINT "_BranchToMeasurementUnit_B_fkey" FOREIGN KEY ("B") REFERENCES "MeasurementUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToPermission" ADD CONSTRAINT "_BranchToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToPermission" ADD CONSTRAINT "_BranchToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToEmployeeGroup" ADD CONSTRAINT "_BranchToEmployeeGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToEmployeeGroup" ADD CONSTRAINT "_BranchToEmployeeGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "EmployeeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToUser" ADD CONSTRAINT "_BranchToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToUser" ADD CONSTRAINT "_BranchToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;