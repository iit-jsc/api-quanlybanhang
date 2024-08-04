import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateMeasurementUnitDto, UpdateMeasurementUnitDto } from "./dto/measurement-unit.dto";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { calculatePagination } from "utils/Helps";
import { Prisma } from "@prisma/client";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { CommonService } from "src/common/common.service";

@Injectable()
export class MeasurementUnitService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateMeasurementUnitDto, tokenPayload: TokenPayload) {
    if (data.code)
      await this.commonService.checkDataExistingInBranch({ code: data.code }, "MeasurementUnit", tokenPayload.branchId);

    return await this.prisma.measurementUnit.create({
      data: {
        name: data.name,
        code: data.code,
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
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, orderBy } = params;

    let where: Prisma.MeasurementUnitWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && { name: { contains: keyword } }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.measurementUnit.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          code: true,
          name: true,
          updatedAt: true,
        },
      }),
      this.prisma.measurementUnit.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.MeasurementUnitWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.measurementUnit.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.MeasurementUnitWhereUniqueInput;
      data: UpdateMeasurementUnitDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    if (data.code)
      await this.commonService.checkDataExistingInBranch(
        { code: data.code },
        "MeasurementUnit",
        tokenPayload.branchId,
        where.id,
      );

    return this.prisma.measurementUnit.update({
      data: {
        name: data.name,
        code: data.code,
        updater: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.measurementUnit.updateMany({
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
