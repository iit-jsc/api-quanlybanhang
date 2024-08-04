import { Promotion } from "@prisma/client";

export interface TokenPayload {
  accountId?: string;
  shopId?: string;
  userId?: string;
  branchId?: string;
  type?: number;
  deviceId?: string;
}

export interface TokenCustomerPayload {
  customerId: string;
}

export interface PaginationResult {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

export interface Condition {
  id?: string;
  isPublic: boolean;
  shop: {
    id: string;
    isPublic: boolean;
  };
  detailPermissions?: {
    some: {
      isPublic: boolean;
    };
  };
  [key: string]: any;
}

export interface AnyObject {
  [key: string]: any;
}

export interface PromotionCountOrder extends Promotion {
  _count: {
    orders: number;
  };
}

export interface DeleteManyResponse {
  count: number;
  ids: string[];
  notValidIds?: string[];
}

export interface CustomerShape {
  id: string;
  discount: number;
  discountType: number;
  endow: number;
  customerType?: {
    id: string;
    discount: number;
    discountType: number;
  };
}
