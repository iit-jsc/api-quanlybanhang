import { TokenPayload } from './../interfaces/common.interface';
import { generate as generateIdentifier } from 'short-uuid';
import { PaginationResult } from 'interfaces/common.interface';
import { ACCOUNT_TYPE } from 'enums/user.enum';
export function generateUniqueId(): string {
  return generateIdentifier();
}

export function calculatePagination(
  totalRecords: number,
  skip: number,
  take: number,
): PaginationResult {
  const totalPages = Math.ceil(totalRecords / take);
  const currentPage = Math.floor(skip / take) + 1;

  return {
    totalRecords,
    totalPages,
    currentPage,
  };
}

export function roleBasedBranchFilter(tokenPayload: TokenPayload) {
  const baseConditions = {
    isPublic: true,
    shop: {
      id: tokenPayload.shopId,
      isPublic: true,
    },
  };

  return tokenPayload.type !== ACCOUNT_TYPE.STORE_OWNER
    ? {
        ...baseConditions,
        id: tokenPayload.branchId,
      }
    : baseConditions;
}

export function onlyBranchFilter(tokenPayload: TokenPayload) {
  return {
    id: tokenPayload.branchId,
    isPublic: true,
  };
}

export function detailPermissionFilter(tokenPayload: TokenPayload) {
  return {
    some: {
      isPublic: true,
      branchId: tokenPayload.branchId,
    },
  };
}
