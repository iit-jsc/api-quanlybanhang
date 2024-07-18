import { Injectable } from "@nestjs/common";
import { CreateWorkShiftDto, UpdateWorkShiftDto } from "./dto/work-shift.dto";
import { TokenPayload } from "interfaces/common.interface";
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
        createdBy: tokenPayload.accountId,
        branchId: tokenPayload.branchId,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    const keySearch = ["name"];

    let where: Prisma.WorkShiftWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: "insensitive" },
        })),
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.workShift.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        where,
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          limitEmployee: true,
          isNotLimitEmployee: true,
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
    return this.prisma.workShift.update({
      where: {
        id: params.where.id,
        branchId: tokenPayload.branchId,
        isPublic: true,
      },
      data: {
        name: params.data.name,
        startTime: params.data.startTime,
        endTime: params.data.endTime,
        limitEmployee: params.data.limitEmployee,
        isNotLimitEmployee: params.data.isNotLimitEmployee,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {}
}
