import { Injectable } from "@nestjs/common";
import { CreateWorkShiftDto, UpdateWorkShiftDto } from "./dto/work-shift.dto";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { Prisma } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";
import { calculatePagination } from "utils/Helps";

@Injectable()
export class WorkShiftService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWorkShiftDto, tokenPayload: TokenPayload) {
    return this.prisma.workShift.create({
      data: {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        limitEmployee: data.limitEmployee,
        isNotLimitEmployee: data.isNotLimitEmployee,
        description: data.description,
        createdBy: tokenPayload.accountId,
        branchId: tokenPayload.branchId,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, from, to } = params;

    const keySearch = ["name"];

    let where: Prisma.WorkShiftWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: "insensitive" },
        })),
      }),
      ...(from &&
        to && {
          date: {
            gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
      ...(from &&
        !to && {
          date: {
            gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
          },
        }),
      ...(!from &&
        to && {
          date: {
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.workShift.findMany({
        skip,
        take,
        where,
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          limitEmployee: true,
          isNotLimitEmployee: true,
          description: true,
          updatedAt: true,
        },
      }),
      this.prisma.workShift.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.WorkShiftWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.workShift.findUniqueOrThrow({
      where: {
        id: where.id,
        branchId: tokenPayload.branchId,
        isPublic: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.WorkShiftWhereUniqueInput;
      data: UpdateWorkShiftDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.workShift.update({
      where: {
        id: where.id,
        branchId: tokenPayload.branchId,
        isPublic: true,
      },
      data: {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        limitEmployee: data.limitEmployee,
        description: data.description,
        isNotLimitEmployee: data.isNotLimitEmployee,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.workShift.updateMany({
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
