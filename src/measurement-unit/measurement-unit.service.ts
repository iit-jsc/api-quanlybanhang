import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateMeasurementUnitDTO } from './dto/create-measurement-unit.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { calculatePagination, roleBasedBranchFilter } from 'utils/Helps';
import { Prisma } from '@prisma/client';
import { FindManyDTO } from 'utils/Common.dto';
import { MEASUREMENT_UNIT_SELECT } from 'enums/select.enum';

@Injectable()
export class MeasurementUnitService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMeasurementUnitDTO, tokenPayload: TokenPayload) {
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

  async findAll(params: FindManyDTO, tokenPayload: TokenPayload) {
    let { skip, take, keyword, branchIds } = params;

    let where: Prisma.MeasurementUnitWhereInput = {
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
      this.prisma.measurementUnit.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: MEASUREMENT_UNIT_SELECT,
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
          some: roleBasedBranchFilter(tokenPayload),
        },
      },
      select: MEASUREMENT_UNIT_SELECT,
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
