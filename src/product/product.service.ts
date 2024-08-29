import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { calculatePagination } from "utils/Helps";
import { CreateProductDto, UpdateProductDto } from "./dto/product.dto";
import { CommonService } from "src/common/common.service";
import { FindManyProductDto } from "./dto/find-many.dto";
import { DeleteManyDto } from "utils/Common.dto";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";
@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateProductDto, tokenPayload: TokenPayload) {
    await this.commonService.checkDataExistingInBranch(
      { slug: data.slug, code: data.code },
      "Product",
      tokenPayload.branchId,
    );

    const result = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        content: data.content,
        slug: data.slug,
        code: data.code,
        price: data.price,
        thumbnail: data.thumbnail,
        oldPrice: data.oldPrice,
        otherAttributes: data.otherAttributes,
        status: data.status,
        photoURLs: data.photoURLs,
        productType: {
          connect: {
            id: data.productTypeId,
          },
        },
        branch: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
        measurementUnit: {
          connect: {
            id: data.unitId,
          },
        },
        creator: {
          connect: {
            id: tokenPayload.accountId,
          },
        },
      },
    });

    await this.commonService.createActivityLog([result.id], "Product", ACTIVITY_LOG_TYPE.CREATE, tokenPayload);

    return result;
  }

  async findAll(params: FindManyProductDto) {
    let { skip, take, keyword, productTypeIds, measurementUnitIds, statuses, branchId, orderBy } = params;
    const keySearch = ["name", "code", "slug"];
    let where: Prisma.ProductWhereInput = {
      isPublic: true,
      branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword },
        })),
      }),
      ...(productTypeIds?.length > 0 && {
        productType: {
          id: { in: productTypeIds },
        },
      }),
      ...(measurementUnitIds?.length > 0 && {
        measurementUnit: {
          id: { in: measurementUnitIds },
        },
      }),
      ...(statuses && { status: { in: statuses } }),
      status: { in: statuses },
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          branchId: true,
          unitId: true,
          name: true,
          code: true,
          content: true,
          price: true,
          thumbnail: true,
          oldPrice: true,
          description: true,
          photoURLs: true,
          otherAttributes: true,
          status: true,
          slug: true,
          measurementUnit: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          productType: {
            select: {
              id: true,
              name: true,
            },
          },
          updatedAt: true,
        },
      }),
      this.prisma.product.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.ProductWhereInput) {
    return this.prisma.product.findFirst({
      where: {
        ...where,
        isPublic: true,
      },
      include: {
        measurementUnit: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        productType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(
    params: {
      where: Prisma.ProductWhereUniqueInput;
      data: UpdateProductDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    await this.commonService.checkDataExistingInBranch(
      { slug: data.slug, code: data.code },
      "Product",
      tokenPayload.branchId,
      where.id,
    );

    const result = await this.prisma.product.update({
      where: {
        ...where,
        branch: {
          id: tokenPayload.branchId,
        },
        isPublic: true,
      },
      data: {
        name: data.name,
        description: data.description,
        content: data.content,
        slug: data.slug,
        unitId: data.unitId,
        thumbnail: data.thumbnail,
        productTypeId: data.productTypeId,
        code: data.code,
        price: data.price,
        oldPrice: data.oldPrice,
        photoURLs: data.photoURLs,
        otherAttributes: data.otherAttributes,
        status: data.status,
        updatedBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog([result.id], "Product", ACTIVITY_LOG_TYPE.UPDATE, tokenPayload);

    return result;
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.product.updateMany({
      where: {
        id: {
          in: data.ids,
        },
        isPublic: true,
        branch: {
          id: tokenPayload.branchId,
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog(data.ids, "Product", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
