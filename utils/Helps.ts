import { generate as generateIdentifier } from 'short-uuid';

export function generateUniqueId(): string {
  return generateIdentifier();
}

export interface PaginationResult {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
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
export function getAccountPermissionCondition(accountId: number) {
  return {
    detailPermissions: {
      some: {
        user: {
          accounts: {
            some: {
              id: accountId,
            },
          },
        },
      },
    },
  };
}
