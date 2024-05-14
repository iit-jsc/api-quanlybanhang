import { TokenPayload } from './../interfaces/common.interface';
import { generate as generateIdentifier } from 'short-uuid';
import { Type } from 'class-transformer';
import { PaginationResult } from 'interfaces/common.interface';
import { USER_TYPE } from 'enums/user.enum';
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
export function getPermissionBranch(tokenPayload: TokenPayload) {
  if (tokenPayload.type === USER_TYPE.STORE_OWNER)
    return {
      shop: {
        id: tokenPayload.shopId,
        isPublic: true,
      },
    };

  return {
    isPublic: true,
    detailPermissions: {
      some: {
        user: {
          isPublic: true,
          accounts: {
            some: {
              id: tokenPayload.accountId,
              isPublic: true,
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
