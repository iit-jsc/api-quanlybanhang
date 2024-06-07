export interface TokenPayload {
  accountId?: number;
  shopId?: number;
  branchId?: number;
  type?: number;
}

export interface PaginationResult {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

export interface Condition {
  id?: number;
  isPublic: boolean;
  shop: {
    id: number;
    isPublic: boolean;
  };
  detailPermissions?: {
    some: {
      isPublic: boolean;
    };
  };
  [key: string]: any;
}
