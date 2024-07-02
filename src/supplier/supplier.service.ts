import { Injectable } from '@nestjs/common';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { FindManyDto } from 'utils/Common.dto';
import { PrismaService } from 'nestjs-prisma';
import { calculatePagination } from 'utils/Helps';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSupplierDto, tokenPayload: TokenPayload) {
    return this.prisma.supplier.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        note: data.note,
        representativeName: data.representativeName,
        representativePhone: data.representativePhone,
        supplierTypeId: data.supplierTypeId,
        createdBy: tokenPayload.accountId,
        branchId: tokenPayload.branchId,
      },
    });
  }

  update(
    params: {
      where: Prisma.SupplierWhereUniqueInput;
      data: UpdateSupplierDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.supplier.update({
      where: { id: where.id, isPublic: true, branchId: tokenPayload.branchId },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        note: data.note,
        representativeName: data.representativeName,
        representativePhone: data.representativePhone,
        supplierTypeId: data.supplierTypeId,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    const keySearch = ['name'];

    let where: Prisma.SupplierWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.supplier.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          note: true,
          representativeName: true,
          representativePhone: true,
          supplierType: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      }),
      this.prisma.supplier.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  findUniq(where: Prisma.SupplierWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.supplier.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        note: true,
        representativeName: true,
        representativePhone: true,
        supplierType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  deleteMany(where: Prisma.SupplierWhereInput, tokenPayload: TokenPayload) {
    return this.prisma.supplier.updateMany({
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
