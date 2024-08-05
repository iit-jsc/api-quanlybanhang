import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { calculatePagination, generateUniqueId } from "utils/Helps";
import { CreateToppingDto, UpdateToppingDto } from "./dto/topping.dto";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { CommonService } from "src/common/common.service";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";

@Injectable()
export class ToppingService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateToppingDto, tokenPayload: TokenPayload) {
    const result = await this.prisma.topping.create({
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

    this.commonService.createActivityLog([result.id], "Topping", ACTIVITY_LOG_TYPE.CREATE, tokenPayload);

    return result;
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, orderBy } = params;

    const keySearch = ["name"];

    let where: Prisma.ToppingWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword },
        })),
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.topping.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
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
      data: UpdateToppingDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    const result = await this.prisma.topping.update({
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

    this.commonService.createActivityLog([result.id], "Topping", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

    return result;
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

    this.commonService.createActivityLog(data.ids, "Topping", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
