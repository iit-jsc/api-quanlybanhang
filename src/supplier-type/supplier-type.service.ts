import { Injectable } from '@nestjs/common';
import {
  CreateSupplierTypeDto,
  UpdateSupplierTypeDto,
} from './dto/supplier-type.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { Prisma } from '@prisma/client';
import { FindManyDto } from 'utils/Common.dto';
import { PrismaService } from 'nestjs-prisma';
import { calculatePagination } from 'utils/Helps';

@Injectable()
export class SupplierTypeService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSupplierTypeDto, tokenPayload: TokenPayload) {
    return this.prisma.supplierType.create({
      data: {
        name: data.name,
        description: data.description,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
      },
    });
  }

  update(
    params: {
      where: Prisma.SupplierTypeWhereUniqueInput;
      data: UpdateSupplierTypeDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    console.log(where);

    return this.prisma.supplierType.update({
      where: {
        id: where.id,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        name: data.name,
        description: data.description,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    const keySearch = ['name'];

    let where: Prisma.SupplierTypeWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.supplierType.findMany({
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
        },
      }),
      this.prisma.supplierType.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  findUniq(
    where: Prisma.SupplierTypeWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.supplierType.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }

  deleteMany(where: Prisma.SupplierTypeWhereInput, tokenPayload: TokenPayload) {
    return this.prisma.supplierType.updateMany({
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
