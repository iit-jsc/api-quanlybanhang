import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EMPLOYEE_GROUP_SELECT } from 'enums/select.enum';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDTO } from 'utils/Common.dto';
import { calculatePagination, generateUniqueId } from 'utils/Helps';
import { CreateProductTypeDTO } from './dto/create-product-type.dto';

@Injectable()
export class ProductTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductTypeDTO, tokenPayload: TokenPayload) {
    const identifier = generateUniqueId();

    const productTypes = data.branchIds.map((id) => ({
      identifier,
      name: data.name,
      description: data.description,
      branchId: id,
      createdBy: tokenPayload.accountId,
      updatedBy: tokenPayload.accountId,
    })) as Prisma.ProductTypeCreateManyInput[];

    return await this.prisma.productType.createMany({
      data: productTypes,
    });
  }

  async findAll(params: FindManyDTO, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;
    let where: Prisma.ProductTypeWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.productType.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          identifier: true,
          branchId: true,
          name: true,
          description: true,
        },
      }),
      this.prisma.productType.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.ProductTypeWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.productType.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        identifier: true,
        branchId: true,
        name: true,
        description: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.ProductTypeWhereInput;
      data: CreateProductTypeDTO;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    return this.prisma.productType.updateMany({
      where: {
        ...where,
        isPublic: true,
        branch: {
          id: {
            in: data.branchIds,
          },
        },
      },
      data: {
        name: data.name,
        description: data.description,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async removeMany(
    where: Prisma.ProductTypeWhereInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.productType.updateMany({
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
