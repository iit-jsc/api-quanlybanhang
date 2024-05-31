import { Injectable } from '@nestjs/common';
import { TokenPayload } from 'interfaces/common.interface';
import { Prisma } from '@prisma/client';
import { calculatePagination } from 'utils/Helps';
import { FindManyDto } from 'utils/Common.dto';
import { PrismaService } from 'nestjs-prisma';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';

@Injectable()
export class OrderStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderStatusDto, tokenPayload: TokenPayload) {
    return await this.prisma.orderStatus.create({
      data: {
        name: data.name,
        description: data.description,
        shop: {
          connect: {
            id: tokenPayload.shopId,
          },
        },
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;
    let where: Prisma.OrderStatusWhereInput = {
      isPublic: true,
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
      shop: {
        id: tokenPayload.shopId,
        isPublic: true,
      },
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.orderStatus.findMany({
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
      this.prisma.orderStatus.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.OrderStatusWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.orderStatus.findUniqueOrThrow({
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
      },
    });
  }

  async update(
    params: {
      where: Prisma.OrderStatusWhereUniqueInput;
      data: CreateOrderStatusDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    return this.prisma.orderStatus.update({
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
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async removeMany(
    where: Prisma.OrderStatusWhereInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.orderStatus.updateMany({
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
