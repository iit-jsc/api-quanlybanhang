export interface TokenPayload {
  accountId: number;
  shopId?: number;
  branchId?: number;
  type?: number;
}

export interface PaginationResult {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}
