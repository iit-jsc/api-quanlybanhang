import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { calculatePagination, generateUniqueId } from "utils/Helps";
import { CreateToppingDto } from "./dto/create-topping.dto";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";

@Injectable()
export class ToppingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateToppingDto, tokenPayload: TokenPayload) {
    return this.prisma.topping.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        photoURLs: data.photoURLs,
        creator: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
        branch: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    const keySearch = ["name"];

    let where: Prisma.ToppingWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: "insensitive" },
        })),
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.topping.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        where,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          photoURLs: true,
          updatedAt: true,
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

  async findUniq(where: Prisma.ToppingWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.topping.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        photoURLs: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.ToppingWhereUniqueInput;
      data: CreateToppingDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    return this.prisma.topping.update({
      where: {
        id: where.id,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        photoURLs: data.photoURLs,
        updater: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.topping.updateMany({
      where: {
        id: {
          in: data.ids,
        },
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
