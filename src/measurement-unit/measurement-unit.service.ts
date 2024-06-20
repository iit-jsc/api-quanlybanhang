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
        creator: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
        branch: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    let where: Prisma.MeasurementUnitWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
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
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.MeasurementUnitWhereUniqueInput;
      data: Prisma.MeasurementUnitUpdateInput;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.measurementUnit.update({
      data: {
        name: data.name,
        code: data.code,
        updater: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
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
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }
}
