import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    const { skip, take, orderBy, from, to } = params;

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

    const [data, totalRecords] = await Promise.all([
      this.prisma.activityLog.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        where,
      }),
      this.prisma.activityLog.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }
}
