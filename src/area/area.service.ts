import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";
import { CreateAreaDto, UpdateAreaDto } from "./dto/area.dto";
import { CommonService } from "src/common/common.service";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";

@Injectable()
export class AreaService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) { }

  async create(data: CreateAreaDto, tokenPayload: TokenPayload) {
    const area = await this.prisma.area.create({
      data: {
        ...(data.code && {
          code: data.code,
        }),
        name: data.name,
        description: data.description,
        photoURL: data.photoURL,
        tables: {
          create: {
            name: "Bàn 01",
            isPublic: true,
            branchId: tokenPayload.branchId,
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

    await this.commonService.createActivityLog([area.id], "Area", ACTIVITY_LOG_TYPE.CREATE, tokenPayload);

    return area;
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    const { skip, take, keyword, orderBy } = params;

    const keySearch = ["name", "code"];

    const where: Prisma.AreaWhereInput = {
      isPublic: true,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword },
        })),
      }),
      branch: {
        id: tokenPayload.branchId,
        isPublic: true,
      },
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.area.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          name: true,
          description: true,
          code: true,
          photoURL: true,
          tables: {
            where: {
              isPublic: true,
            },
            select: {
              id: true,
              name: true,
              code: true,
              photoURL: true,
              description: true,
            },
          },
          updatedAt: true,
        },
      }),
      this.prisma.area.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.AreaWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.area.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branch: {
          isPublic: true,
          id: tokenPayload.branchId,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        code: true,
        photoURL: true,
        tables: {
          where: {
            branchId: tokenPayload.branchId,
            isPublic: true,
          },
          select: {
            id: true,
            name: true,
            code: true,
            photoURL: true,
            description: true,
          },
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.AreaWhereUniqueInput;
      data: UpdateAreaDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    const area = await this.prisma.area.update({
      where: {
        id: where.id,
        isPublic: true,
        branch: {
          id: tokenPayload.branchId,
          isPublic: true,
        },
      },
      data: {
        name: data.name,
        code: data.code,
        photoURL: data.photoURL,
        description: data.description,
        updatedBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog([area.id], "Area", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

    return area;
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.area.updateMany({
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

    await this.prisma.table.updateMany({
      where: {
        area: {
          id: {
            in: data.ids,
          },
        },
        isPublic: true,
      },
      data: {
        isPublic: false,
      },
    });

    await this.commonService.createActivityLog(data.ids, "Area", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
