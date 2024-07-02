import { Injectable } from '@nestjs/common';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { calculatePagination, roleBasedBranchFilter } from 'utils/Helps';
import { Prisma } from '@prisma/client';
import { FindManyDto } from 'utils/Common.dto';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePermissionDto, tokenPayload: TokenPayload) {
    return this.prisma.permission.create({
      data: {
        name: data.name,
        description: data.description,
        branch: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
        roles: {
          connect: data.roleIds.map((id) => ({
            id,
          })),
        },
        creator: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
      include: {
        roles: true,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    const where: Prisma.PermissionWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
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
          branch: {
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
      data: Prisma.PermissionUpdateInput;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.permission.update({
      data: {
        name: data.name,
        description: data.description,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
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
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        branch: {
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
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }
}
