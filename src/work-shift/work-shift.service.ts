import { Injectable } from "@nestjs/common";
import { CreateWorkShiftDto, FindManyWorkShiftDto, UpdateWorkShiftDto } from "./dto/work-shift.dto";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto } from "utils/Common.dto";
import { Prisma } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";
import { customPaginate } from "utils/Helps";
import { CommonService } from "src/common/common.service";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";

@Injectable()
export class WorkShiftService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateWorkShiftDto, tokenPayload: TokenPayload) {
    const result = await this.prisma.workShift.create({
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

    await this.commonService.createActivityLog([result.id], "WorkShift", ACTIVITY_LOG_TYPE.CREATE, tokenPayload);

    return result;
  }

  async findAll(params: FindManyWorkShiftDto, tokenPayload: TokenPayload) {
    let { page, perPage, keyword, from, to, orderBy } = params;

    const keySearch = ["name"];

    let where: Prisma.WorkShiftWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword },
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

    return await customPaginate(
      this.prisma.workShift,
      {
        orderBy: orderBy || { createdAt: "desc" },
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
      },
      {
        page,
        perPage,
      },
    );

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

    const result = await this.prisma.workShift.update({
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

    await this.commonService.createActivityLog([result.id], "WorkShift", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

    return result;
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

    await this.commonService.createActivityLog(data.ids, "WorkShift", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
