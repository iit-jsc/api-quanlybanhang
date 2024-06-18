import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { calculatePagination, generateUniqueId } from 'utils/Helps';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { FindManyProductTypeDto } from './dto/find-many.dto';
import * as slug from 'slug';

@Injectable()
export class ProductTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductTypeDto, tokenPayload: TokenPayload) {
    const identifier = generateUniqueId();

    const productTypes = data.branchIds.map((id, index) => ({
      identifier,
      branchApplies: {
        connect: data.branchIds.map((branchId) => ({ id: branchId })),
      },
      branch: {
        connect: {
          id,
        },
      },
      name: data.name,
      slug: slug(`${data.name}-${Math.floor(Date.now() / 1000)}${index}`),
      description: data.description,
      createdBy: tokenPayload.accountId,
      updatedBy: tokenPayload.accountId,
    })) as Prisma.ProductTypeCreateInput[];

    const createProductTypePromises = productTypes.map((productType) => {
      return this.prisma.productType.create({
        data: productType,
      });
    });

    const results = await this.prisma.$transaction(createProductTypePromises);

    return results;
  }

  async findAll(params: FindManyProductTypeDto) {
    let { skip, take, keyword, branchId } = params;
    let where: Prisma.ProductTypeWhereInput = {
      isPublic: true,
      branchId: branchId,
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
          slug: true,
          branchId: true,
          name: true,
          description: true,
          branchApplies: {
            select: {
              id: true,
              name: true,
              photoURL: true,
            },
            where: {
              isPublic: true,
            },
          },
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

  async findUniq(where: Prisma.ProductTypeWhereUniqueInput) {
    return this.prisma.productType.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
      },
      select: {
        id: true,
        identifier: true,
        slug: true,
        branchId: true,
        name: true,
        description: true,
        branchApplies: {
          select: {
            id: true,
            name: true,
            photoURL: true,
          },
          where: {
            isPublic: true,
          },
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.ProductTypeWhereInput;
      data: CreateProductTypeDto;
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
