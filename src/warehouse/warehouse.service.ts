import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { Prisma } from '@prisma/client';
import { FindManyDto } from 'utils/Common.dto';
import { calculatePagination } from 'utils/Helps';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWarehouseDto) {
    return await this.prisma.warehouse.create({
      data: {
        name: data.name,
        address: data.address,
        photoURLs: data.photoURLs,
        branchId: data.branchId,
      },
    });
  }

  async update(
    params: {
      where: Prisma.WarehouseWhereUniqueInput;
      data: UpdateWarehouseDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    return await this.prisma.warehouse.update({
      data: {
        name: data.name,
        address: data.address,
        photoURLs: data.photoURLs,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        ...where,
        branchId: tokenPayload.branchId,
        isPublic: true,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    const keySearch = ['name'];

    let where: Prisma.WarehouseWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.warehouse.findMany({
        skip,
        take,
        where,
      }),
      this.prisma.warehouse.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.WarehouseWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.warehouse.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });
  }

  async deleteMany(
    where: Prisma.WarehouseWhereInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.warehouse.updateMany({
      where: {
        id: where.id,
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