import { Injectable } from '@nestjs/common';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { calculatePagination, roleBasedBranchFilter } from 'utils/Helps';
import { Prisma } from '@prisma/client';
import { FindManyDto } from 'utils/Common.dto';
import { PERMISSION_SELECT } from 'enums/select.enum';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePermissionDto, tokenPayload: TokenPayload) {
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
        roles: {
          connect: data.roleIds.map((id) => ({
            id,
          })),
        },
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
      },
      include: {
        roles: true,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, branchIds, keyword } = params;

    const where: Prisma.PermissionWhereInput = {
      isPublic: true,
      branches: {
        some: roleBasedBranchFilter(tokenPayload),
      },
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
      ...(branchIds?.length > 0 && {
        branches: {
          some: {
            id: { in: branchIds },
            ...roleBasedBranchFilter(tokenPayload),
          },
        },
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.permission.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          name: true,
          description: true,
          branches: {
            select: {
              id: true,
              photoURL: true,
              name: true,
              address: true,
              createdAt: true,
            },
            where: { isPublic: true },
          },
          roles: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
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
      where: {
        ...where,
        branches: {
          some: roleBasedBranchFilter(tokenPayload),
        },
      },
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
      where: {
        ...where,
        isPublic: true,
        branches: {
          some: roleBasedBranchFilter(tokenPayload),
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }
}
