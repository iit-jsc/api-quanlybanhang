import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateMeasurementUnitDto } from './dto/create-measurement-unit.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { calculatePagination } from 'utils/Helps';
import { Prisma } from '@prisma/client';
import { FindManyDto } from 'utils/Common.dto';

@Injectable()
export class MeasurementUnitService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMeasurementUnitDto, tokenPayload: TokenPayload) {
    return await this.prisma.measurementUnit.create({
      data: {
        name: data.name,
        code: data.code,
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
        branches: {
          connect: data.branchIds.map((id) => ({
            id,
            shop: { isPublic: true, id: tokenPayload.shopId },
          })),
        },
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, branchIds } = params;

    let where: Prisma.MeasurementUnitWhereInput = {
      isPublic: true,
      branches: {
        some: {
          shop: {
            id: tokenPayload.shopId,
            isPublic: true,
          },
        },
      },
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
      ...(branchIds?.length > 0 && {
        branches: {
          some: {
            isPublic: true,
            id: { in: branchIds },
            shop: {
              id: tokenPayload.shopId,
              isPublic: true,
            },
          },
        },
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.measurementUnit.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          name: true,
          code: true,
          branches: {
            select: {
              id: true,
              photoURL: true,
              name: true,
              address: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.measurementUnit.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findAllForBranch(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    let where: Prisma.MeasurementUnitWhereInput = {
      isPublic: true,
      branches: {
        some: {
          id: tokenPayload.branchId,
        },
      },
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.measurementUnit.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          name: true,
          code: true,
          branches: {
            select: {
              id: true,
              photoURL: true,
              name: true,
              address: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.measurementUnit.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.MeasurementUnitWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.measurementUnit.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branches: {
          some: {
            id: tokenPayload.branchId,
            isPublic: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
        branches: {
          select: {
            id: true,
            photoURL: true,
            name: true,
            address: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.MeasurementUnitWhereUniqueInput;
      data: Prisma.MeasurementUnitUpdateInput & { branchIds: number[] };
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.measurementUnit.update({
      data: {
        name: data.name,
        code: data.code,
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
        isPublic: true,
        branches: {
          some: {
            id: tokenPayload.branchId,
            isPublic: true,
          },
        },
      },
    });
  }

  async removeMany(
    where: Prisma.MeasurementUnitWhereInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.measurementUnit.updateMany({
      where: {
        ...where,
        isPublic: true,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }
}
