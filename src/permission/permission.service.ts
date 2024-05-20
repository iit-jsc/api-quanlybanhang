import { HttpStatus, Injectable } from '@nestjs/common';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { CreatePermissionDTO } from './dto/create-permission.dto';
import { calculatePagination, roleBasedBranchFilter } from 'utils/Helps';
import { Prisma } from '@prisma/client';
import { FindManyDTO } from 'utils/Common.dto';
import { PERMISSION_SELECT } from 'enums/select.enum';
import { CustomHttpException } from 'utils/ApiErrors';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePermissionDTO, tokenPayload: TokenPayload) {
    return this.prisma.permission.create({
      data: {
        name: data.name,
        description: data.description,
        branches: {
          connect: data.branchIds.map((id) => ({
            id,
            shop: { isPublic: true, id: tokenPayload.shopId },
          })),
        },
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findAll(params: FindManyDTO, tokenPayload: TokenPayload) {
    let { skip, take, branchIds, keyword } = params;

    const where = {
      isPublic: true,
      branches: {
        some: roleBasedBranchFilter(tokenPayload),
      },
      AND: [],
    };

    if (keyword) {
      where.AND.push({
        OR: [{ name: { contains: keyword, mode: 'insensitive' } }],
      });
    }

    if (branchIds && branchIds.length > 0) {
      where.AND.push({
        branches: {
          some: {
            id: { in: branchIds },
          },
        },
      });
    }

    const [data, totalRecords] = await Promise.all([
      this.prisma.permission.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: PERMISSION_SELECT,
      }),
      this.prisma.permission.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async update(
    params: {
      where: Prisma.PermissionWhereUniqueInput;
      data: Prisma.PermissionUpdateInput & { branchIds: number[] };
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.permission.update({
      data: {
        name: data.name,
        description: data.description,
        branches: {
          set: [],
          connect: data.branchIds.map((id) => ({
            id,
          })),
        },
        updatedBy: tokenPayload.accountId,
      },
      where,
    });
  }

  async findUniq(
    where: Prisma.PermissionWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.permission.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branches: {
          some: roleBasedBranchFilter(tokenPayload),
        },
      },
      select: PERMISSION_SELECT,
    });
  }

  async removeMany(
    where: Prisma.PermissionWhereInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.permission.updateMany({
      where: { ...where, isPublic: true },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findByIdWithBranch(id: number, branchId: number) {
    const permission = await this.prisma.permission.findUnique({
      where: {
        id: +id,
        isPublic: true,
        branches: {
          some: {
            id: branchId,
          },
        },
      },
    });

    if (!permission)
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        '#1 findByIdWithBranch - Nhóm quyền không tồn tại!',
      );

    return permission;
  }
}
