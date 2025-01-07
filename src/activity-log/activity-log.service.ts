import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { FindManyDto } from "utils/Common.dto";
import { calculatePagination, customPaginate } from "utils/Helps";
import { FindManyActivityLogDto } from "./dto/activity-log.dto";

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(params: FindManyActivityLogDto, tokenPayload: TokenPayload) {
    const { page, perPage, orderBy, from, to } = params;

    const where: Prisma.ActivityLogWhereInput = {
      branch: {
        id: tokenPayload.branchId,
        isPublic: true,
      },
      ...(from &&
        to && {
          createdAt: {
            gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      ...(from &&
        !to && {
          createdAt: {
            gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
          },
        }),
      ...(!from &&
        to && {
          createdAt: {
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
    };

    return await customPaginate(
      this.prisma.activityLog,
      {
        orderBy: orderBy || { createdAt: "desc" },
        where,
      },
      {
        page,
        perPage,
      },
    );
  }
}
