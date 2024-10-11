import { CommonService } from "src/common/common.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { calculatePagination } from "utils/Helps";
import { CreateProductTypeDto, UpdateProductTypeDto } from "./dto/product-type.dto";
import { FindManyProductTypeDto } from "./dto/find-many.dto";
import { DeleteManyDto } from "utils/Common.dto";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";

@Injectable()
export class ProductTypeService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) { }

  async create(data: CreateProductTypeDto, tokenPayload: TokenPayload) {
    const result = await this.prisma.productType.create({
      data: {
        branch: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
        name: data.name,
        slug: data.slug,
        description: data.description,
        creator: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
    });

    await this.commonService.createActivityLog([result.id], "ProductType", ACTIVITY_LOG_TYPE.CREATE, tokenPayload);

    return result;
  }

  async findAll(params: FindManyProductTypeDto) {
    let { skip, take, keyword, branchId, orderBy } = params;
    let where: Prisma.ProductTypeWhereInput = {
      isPublic: true,
      branchId: branchId,
      ...(keyword && { name: { contains: keyword } }),
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.productType.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          slug: true,
          branchId: true,
          name: true,
          description: true,
          products: {
            where: {
              isPublic: true,
            },
          },
          updatedAt: true,
        },
      }),
      this.prisma.productType.count({
        where,
      }),
    ]);
    return {
      list: branchId ? data : [],
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.ProductTypeWhereInput) {
    return this.prisma.productType.findFirst({
      where: {
        ...where,
        branchId: where.branchId,
        isPublic: true,
      },
      select: {
        id: true,
        slug: true,
        branchId: true,
        name: true,
        description: true,
        products: {
          where: {
            isPublic: true,
          },
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.ProductTypeWhereUniqueInput;
      data: UpdateProductTypeDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    const result = await this.prisma.productType.update({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        updater: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
    });

    await this.commonService.createActivityLog([result.id], "ProductType", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

    return result;
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.productType.updateMany({
      where: {
        id: {
          in: data.ids,
        },
        isPublic: true,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog(data.ids, "ProductType", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
