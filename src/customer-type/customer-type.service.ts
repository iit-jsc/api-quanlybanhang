import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDto } from 'utils/Common.dto';
import { calculatePagination, generateUniqueId } from 'utils/Helps';
import { CreateCustomerTypeDto } from './dto/create-customer-type';

@Injectable()
export class CustomerTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCustomerTypeDto, tokenPayload: TokenPayload) {
    return await this.prisma.customerType.create({
      data: {
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discount: data.discount,
        shop: {
          connect: {
            id: tokenPayload.shopId,
          },
        },
        creator: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;
    let where: Prisma.CustomerTypeWhereInput = {
      isPublic: true,
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
      shop: {
        id: tokenPayload.shopId,
        isPublic: true,
      },
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.customerType.findMany({
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
          discount: true,
          discountType: true,
        },
      }),
      this.prisma.customerType.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.CustomerTypeWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.customerType.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        discount: true,
        discountType: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.CustomerTypeWhereUniqueInput;
      data: CreateCustomerTypeDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    return this.prisma.customerType.update({
      where: {
        id: where.id,
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
      },
      data: {
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discount: data.discount,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async deleteMany(
    where: Prisma.CustomerTypeWhereInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.customerType.updateMany({
      where: {
        ...where,
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }
}
