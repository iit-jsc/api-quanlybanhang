import { CreateBranchDto, UpdateBranchDto } from "src/branch/dto/create-branch.dto";
import { Injectable } from "@nestjs/common";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { calculatePagination } from "utils/Helps";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { CommonService } from "src/common/common.service";
import { ShopService } from "src/shop/shop.service";

@Injectable()
export class BranchService {
  constructor(
    private readonly prisma: PrismaService,
    private shopService: ShopService,
  ) {}

  async create(createBranchDto: CreateBranchDto, tokenPayload: TokenPayload) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const branch = await this.prisma.branch.create({
        data: {
          name: createBranchDto.name,
          address: createBranchDto.address,
          photoURL: createBranchDto.photoURL,
          status: createBranchDto.status,
          phone: createBranchDto.phone,
          others: createBranchDto.others,
          creator: {
            connect: {
              id: tokenPayload.accountId,
            },
          },
          shop: {
            connect: {
              id: tokenPayload.shopId,
            },
          },
          accounts: {
            connect: {
              id: tokenPayload.accountId,
            },
          },
        },
      });

      await this.shopService.createSampleData(branch.id, null, prisma);

      return branch;
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, orderBy } = params;

    let where: Prisma.BranchWhereInput = {
      isPublic: true,
      shop: {
        id: tokenPayload.shopId,
        isPublic: true,
      },
      ...(keyword && { name: { contains: keyword, mode: "insensitive" } }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.branch.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          photoURL: true,
          name: true,
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.branch.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.BranchWhereUniqueInput, tokenPayload: TokenPayload) {
    return await this.prisma.branch.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.BranchWhereUniqueInput;
      data: UpdateBranchDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.branch.update({
      data: {
        name: data.name,
        address: data.address,
        photoURL: data.photoURL,
        status: data.status,
        phone: data.phone,
        others: data.others,
        updater: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
      where: {
        ...where,
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
        accounts: {
          some: {
            isPublic: true,
          },
        },
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.branch.updateMany({
      where: {
        id: {
          in: data.ids,
        },
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
        accounts: {
          some: {
            isPublic: true,
          },
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
