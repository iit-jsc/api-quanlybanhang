import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateMeasurementUnitDTO } from './dto/create-measurement-unit.dto';
import { TokenPayload } from 'interfaces/common.interface';
import {
  calculatePagination,
  getAccountPermissionCondition,
} from 'utils/Helps';
import { Prisma } from '@prisma/client';
import { FindMeasurementUnitDTO } from './dto/find-measurement-unit.dto';

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
          connect: data.branchIds.map((id) => ({ id })),
        },
      },
    });
  }

  async findAll(params: FindMeasurementUnitDTO, tokenPayload: TokenPayload) {
    let { skip, take } = params;

    const where = {
      isPublic: true,
      branches: {
        some: getAccountPermissionCondition(tokenPayload.accountId),
      },
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
        branches: {
          some: getAccountPermissionCondition(tokenPayload.accountId),
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
          },
        },
      },
    });
  }

  async update(params: {
    where: Prisma.MeasurementUnitWhereUniqueInput;
    data: Prisma.MeasurementUnitUpdateInput;
  }) {
    const { where, data } = params;
  }
}
