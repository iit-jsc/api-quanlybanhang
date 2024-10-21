import { Injectable } from "@nestjs/common";
import { CreateTableDto, UpdateTableDto } from "./dto/table.dto";
import { PrismaService } from "nestjs-prisma";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { Prisma } from "@prisma/client";
import { calculatePagination } from "utils/Helps";
import { CommonService } from "src/common/common.service";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";

@Injectable()
export class TableService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) { }

  async create(data: CreateTableDto, tokenPayload: TokenPayload) {
    const result = await this.prisma.table.create({
      data: {
        name: data.name,
        seat: data.seat,
        area: {
          connect: {
            id: data.areaId,
            isPublic: true,
          },
        },
        branch: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
        creator: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
    });

    await this.commonService.createActivityLog([result.id], "Table", ACTIVITY_LOG_TYPE.CREATE, tokenPayload);

    return result;
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    const { skip, take, keyword, areaIds, orderBy } = params;

    const keySearch = ["name", "code"];

    const where: Prisma.TableWhereInput = {
      isPublic: true,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword },
        })),
      }),
      ...(areaIds?.length > 0 && {
        area: {
          id: { in: areaIds },
        },
      }),
      branch: {
        id: tokenPayload.branchId,
        isPublic: true,
      },
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.table.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: "desc" },
        include: {
          area: {
            select: {
              id: true,
              name: true,
              photoURL: true,
            },
          },
          orderDetails: {
            where: {
              isPublic: true,
            },
            orderBy: { createdAt: "desc" }
          },
        },
      }),
      this.prisma.table.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.TableWhereUniqueInput) {
    return this.prisma.table.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
      },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            photoURL: true,
          },
        },
        orderDetails: {
          where: { isPublic: true },
          select: {
            id: true,
            amount: true,
            note: true,
            status: true,
            product: true,
            productOptions: true,
          },
          orderBy: { createdAt: "desc" }
        },
        tableTransactions: {
          where: { isPublic: true },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            type: true,
            orderDetails: {
              where: {
                isPublic: true,
              },
              select: {
                id: true,
                status: true,
                amount: true,
                note: true,
                product: true,
                productOptions: true,
              },
            },
          },
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.TableWhereUniqueInput;
      data: UpdateTableDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    const result = await this.prisma.table.update({
      where: {
        id: where.id,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        name: data.name,
        seat: data.seat,
        ...(data.areaId && {
          area: {
            connect: {
              id: data.areaId,
              isPublic: true,
            },
          },
        }),
        updater: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
    });

    await this.commonService.createActivityLog([result.id], "Table", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

    return result;
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.table.updateMany({
      where: {
        id: {
          in: data.ids,
        },
        isPublic: true,
        branch: {
          id: tokenPayload.branchId,
          isPublic: true,
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog(data.ids, "Table", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
