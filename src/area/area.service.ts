import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { customPaginate } from "utils/Helps";
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
        name: data.name,
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
    const { page, perPage, keyword, orderBy } = params;

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

    return await customPaginate(
      this.prisma.area,
      {
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          name: true,
          photoURL: true,
          updatedAt: true,
          tables: {
            where: {
              isPublic: true,
            },
            select: {
              id: true,
              name: true,
              seat: true,
              updatedAt: true,
            }
          },
        },
      },
      {
        page,
        perPage,
      },
    );

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
      include: {
        tables: {
          where: {
            branchId: tokenPayload.branchId,
            isPublic: true,
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
        photoURL: data.photoURL,
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
