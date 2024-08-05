import { Injectable } from "@nestjs/common";
import { CreateSupplierTypeDto, UpdateSupplierTypeDto } from "./dto/supplier-type.dto";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { Prisma } from "@prisma/client";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { PrismaService } from "nestjs-prisma";
import { calculatePagination } from "utils/Helps";
import { CommonService } from "src/common/common.service";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";

@Injectable()
export class SupplierTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
  ) {}

  async create(data: CreateSupplierTypeDto, tokenPayload: TokenPayload) {
    const result = await this.prisma.supplierType.create({
      data: {
        name: data.name,
        description: data.description,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
      },
    });

    this.commonService.createActivityLog([result.id], "SupplierType", ACTIVITY_LOG_TYPE.CREATE, tokenPayload);

    return result;
  }

  async update(
    params: {
      where: Prisma.SupplierTypeWhereUniqueInput;
      data: UpdateSupplierTypeDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    const result = await this.prisma.supplierType.update({
      where: {
        id: where.id,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        name: data.name,
        description: data.description,
        updatedBy: tokenPayload.accountId,
      },
    });

    this.commonService.createActivityLog([result.id], "SupplierType", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

    return result;
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, orderBy } = params;

    const keySearch = ["name"];

    let where: Prisma.SupplierTypeWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword },
        })),
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.supplierType.findMany({
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
      this.prisma.supplierType.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  findUniq(where: Prisma.SupplierTypeWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.supplierType.findUniqueOrThrow({
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

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.supplierType.updateMany({
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

    this.commonService.createActivityLog(data.ids, "Supplier", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
