import { generate as generateIdentifier } from 'short-uuid';
import { Type } from 'class-transformer';
import { PaginationResult } from 'interfaces/common.interface';
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

export class FindManyDTO {
  @Type(() => Number)
  skip?: number;

  @Type(() => Number)
  take?: number;
}
