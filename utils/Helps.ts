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
export function determineAccessConditions(
  tokenPayload: TokenPayload,
  modelBinding?: string,
) {
  if (tokenPayload.type !== USER_TYPE.STORE_OWNER) {
    const condition = {
      isPublic: true,
      shop: {
        id: tokenPayload.shopId,
        isPublic: true,
      },
      detailPermissions: {
        some: {
          isPublic: true,
        },
      },
    };

    if (modelBinding) {
      condition[modelBinding] = {
        some: {
          isPublic: true,
          branches: {
            some: {
              id: tokenPayload.branchId,
            },
          },
        },
      };
    }

    return condition;
  }

  return {
    isPublic: true,
    shop: {
      id: tokenPayload.shopId,
      isPublic: true,
    },
  };
}
