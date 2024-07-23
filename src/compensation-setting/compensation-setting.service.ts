import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { Prisma } from "@prisma/client";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";
import { CreateCompensationSettingDto, UpdateCompensationSettingDto } from "./dto/compensation-setting.dto";

@Injectable()
export class CompensationSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCompensationSettingDto, tokenPayload: TokenPayload) {
    return await this.prisma.compensationSetting.create({
      data: {
        name: data.name,
        description: data.description,
        defaultValue: data.defaultValue,
        type: data.type,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
      },
    });
  }

  async update(
    params: {
      where: Prisma.CompensationSettingWhereUniqueInput;
      data: UpdateCompensationSettingDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return await this.prisma.compensationSetting.update({
      where: {
        id: where.id,
        branchId: tokenPayload.branchId,
        isPublic: true,
      },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        defaultValue: data.defaultValue,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    const { skip, take, keyword, types } = params;

    const keySearch = ["name", "code"];

    const where: Prisma.CompensationSettingWhereInput = {
      isPublic: true,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: "insensitive" },
        })),
      }),
      ...(types && { type: { in: types } }),
      branch: {
        id: tokenPayload.branchId,
        isPublic: true,
      },
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.compensationSetting.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        where,
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          updatedAt: true,
        },
      }),
      this.prisma.compensationSetting.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.CompensationSettingWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.compensationSetting.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branch: {
          isPublic: true,
          id: tokenPayload.branchId,
        },
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.compensationSetting.updateMany({
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

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
