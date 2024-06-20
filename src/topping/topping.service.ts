import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { calculatePagination, generateUniqueId } from 'utils/Helps';
import { CreateToppingDto } from './dto/create-topping.dto';
import { FindManyDto } from 'utils/Common.dto';

@Injectable()
export class ToppingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateToppingDto, tokenPayload: TokenPayload) {
    const identifier = generateUniqueId();

    const toppings = data.branchIds.map((id) => ({
      identifier,
      branchApplies: {
        connect: data.branchIds.map((branchId) => ({ id: branchId })),
      },
      branch: {
        connect: {
          id: id,
        },
      },
      name: data.name,
      description: data.description,
      price: data.price,
      photoURLs: data.photoURLs,
      createdBy: tokenPayload.accountId,
      updatedBy: tokenPayload.accountId,
    })) as Prisma.ToppingCreateInput[];

    const createToppingPromises = toppings.map((topping) => {
      return this.prisma.topping.create({
        data: topping,
      });
    });

    const results = await this.prisma.$transaction(createToppingPromises);

    return results;
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    const keySearch = ['name'];

    let where: Prisma.ToppingWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.topping.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          identifier: true,
          name: true,
          description: true,
          price: true,
          photoURLs: true,
        },
      }),
      this.prisma.topping.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.ToppingWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.topping.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        identifier: true,
        name: true,
        description: true,
        price: true,
        photoURLs: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.ToppingWhereInput;
      data: CreateToppingDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    return this.prisma.topping.updateMany({
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
        price: data.price,
        photoURLs: data.photoURLs,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async removeMany(
    where: Prisma.ToppingWhereInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.topping.updateMany({
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
