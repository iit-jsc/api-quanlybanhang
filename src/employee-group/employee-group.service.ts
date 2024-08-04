import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateEmployeeGroupDto, UpdateEmployeeGroupDto } from "./dto/employee-group.dto";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { Prisma } from "@prisma/client";
import { calculatePagination } from "utils/Helps";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";

@Injectable()
export class EmployeeGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEmployeeGroupDto, tokenPayload: TokenPayload) {
    return this.prisma.employeeGroup.create({
      data: {
        name: data.name,
        description: data.description,
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
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, orderBy } = params;

    let where: Prisma.EmployeeGroupWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && { name: { contains: keyword, mode: "insensitive" } }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.employeeGroup.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          name: true,
          description: true,
          updatedAt: true,
        },
      }),
      this.prisma.employeeGroup.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.EmployeeGroupWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.employeeGroup.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.EmployeeGroupWhereUniqueInput;
      data: UpdateEmployeeGroupDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.employeeGroup.update({
      data: {
        name: data.name,
        description: data.description,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        id: where.id,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.employeeGroup.updateMany({
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
