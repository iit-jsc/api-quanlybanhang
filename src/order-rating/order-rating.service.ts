import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateOrderRatingDto } from './dto/create-order-rating.dto';
import { TokenCustomer } from 'interfaces/common.interface';
import { Prisma } from '@prisma/client';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { calculatePagination } from 'utils/Helps';
import { FindManyOrderRatings } from './dto/find-many-order-rating';

@Injectable()
export class OrderRatingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderRatingDto, tokenPayload: TokenCustomer) {
    await this.prisma.order.findFirstOrThrow({
      where: {
        id: data.orderId,
        customerId: tokenPayload.customerId,
      },
    });

    return await this.prisma.orderRating.create({
      data: {
        ratingValue: data.ratingValue,
        comment: data.comment,
        photoURLs: data.photoURLs,
        order: {
          connect: {
            id: data.orderId,
          },
        },
      },
    });
  }

  async update(
    params: {
      data: CreateOrderRatingDto;
      where: Prisma.OrderRatingWhereUniqueInput;
    },
    tokenPayload: TokenCustomer,
  ) {
    const { data, where } = params;

    return await this.prisma.orderRating.update({
      where: {
        id: where.id,
        order: {
          customer: {
            id: tokenPayload.customerId,
          },
        },
      },
      data: {
        ratingValue: data.ratingValue,
        comment: data.comment,
        photoURLs: data.photoURLs,
        order: {
          connect: {
            id: data.orderId,
          },
        },
      },
    });
  }

  async removeMany(
    where: Prisma.OrderRatingWhereInput,
    tokenPayload: TokenCustomer,
  ) {
    await this.prisma.orderRating.updateMany({
      where: {
        ...where,
        order: {
          customer: {
            id: tokenPayload.customerId,
          },
        },
        isPublic: true,
      },
      data: {
        isPublic: false,
      },
    });
  }

  async findAll(params: FindManyOrderRatings, tokenPayload: TokenCustomer) {
    const { skip, take, orderId } = params;

    const where: Prisma.OrderRatingWhereInput = {
      isPublic: true,
      order: {
        id: orderId,
        isPublic: true,
      },
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.orderRating.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
      }),
      this.prisma.orderRating.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }
}
