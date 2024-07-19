import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { calculatePagination, generateUniqueId } from "utils/Helps";
import { CreateProductDto } from "./dto/create-product.dto";
import { CommonService } from "src/common/common.service";
import { FindManyProductDto } from "./dto/find-many.dto";
import * as slug from "slug";
import { DeleteManyDto } from "utils/Common.dto";
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

    return this.prisma.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        code: data.code,
        price: data.price,
        description: data.description,
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
  }

  async findAll(params: FindManyProductDto) {
    let { skip, take, keyword, productTypeIds, measurementUnitIds, statuses, branchId } = params;
    const keySearch = ["name", "code", "sku"];
    let where: Prisma.ProductWhereInput = {
      isPublic: true,
      branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: "insensitive" },
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
        orderBy: {
          createdAt: "desc",
        },
        where,
        select: {
          id: true,
          branchId: true,
          unitId: true,
          name: true,
          code: true,
          price: true,
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
      select: {
        id: true,
        branchId: true,
        unitId: true,
        name: true,
        code: true,
        price: true,
        description: true,
        photoURLs: true,
        otherAttributes: true,
        status: true,
        slug: true,
        measurementUnit: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.ProductWhereUniqueInput;
      data: CreateProductDto;
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

    return this.prisma.product.update({
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
        slug: data.slug,
        unitId: data.unitId,
        productTypeId: data.productTypeId,
        code: data.code,
        price: data.price,
        photoURLs: data.photoURLs,
        otherAttributes: data.otherAttributes,
        status: data.status,
        updatedBy: tokenPayload.accountId,
      },
    });
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

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
