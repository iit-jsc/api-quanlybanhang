import {
  Account,
  Branch,
  Order,
  OrderDetail,
  Product,
  ProductOption,
  Promotion,
  Table,
  TableTransaction,
} from "@prisma/client";

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

export interface IOrderDetail {
  id: string;
  branchId: string;
  orderId?: string | null;
  amount: number;
  note?: string | null;
  status?: number;
  productOptions?: ProductOption[] | null;
  product?: Product | null;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
  branch: Branch;
  order?: Order | null;
  table?: Table | null;
  tableId?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  creator?: Account | null;
  updater?: Account | null;
  tableTransactions: TableTransaction[];
}
