import { ProductOptionGroupController } from "./product-option-group.controller";
import { ProductOptionGroupModule } from "./product-option-group.module";
import { Injectable } from "@nestjs/common";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CommonService } from "src/common/common.service";
import { CreateSupplierTypeDto } from "src/supplier-type/dto/supplier-type.dto";
import { CreateProductOptionGroupDto, UpdateProductOptionGroupDto } from "./dto/product-option-group.dto";
import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";

@Injectable()
export class ProductOptionGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
  ) {}

  async create(data: CreateProductOptionGroupDto, tokenPayload: TokenPayload) {
    const result = await this.prisma.productOptionGroup.create({
      data: {
        name: data.name,
        productOptions: {
          createMany: {
            data: data.productOptions.map((option) => ({
              name: option.name,
              price: option.price,
              branchId: tokenPayload.branchId,
              isMultiple: option.isMultiple,
              photoURL: option.photoURL,
            })),
          },
        },
        productTypes: {
          connect: data.productTypeIds.map((id) => ({ id })),
        },
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
      },
      include: {
        productOptions: true,
      },
    });

    await this.commonService.createActivityLog(
      [result.id],
      "ProductOptionGroup",
      ACTIVITY_LOG_TYPE.CREATE,
      tokenPayload,
    );

    return result;
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, orderBy, productTypeIds } = params;

    let where: Prisma.ProductOptionGroupWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(productTypeIds && {
        productTypes: {
          some: { id: { in: productTypeIds } },
        },
      }),
      ...(keyword && { name: { contains: keyword } }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.productOptionGroup.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        where,
        include: {
          productOptions: true,
        },
      }),
      this.prisma.productOptionGroup.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.ProductOptionGroupWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.productOptionGroup.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      include: {
        productOptions: true,
        productTypes: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.ProductOptionGroupWhereUniqueInput;
      data: UpdateProductOptionGroupDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    const productOptionGroup = await this.prisma.productOptionGroup.update({
      data: {
        name: data.name,
        ...(data.productOptions && {
          productOptions: {
            set: [],
            createMany: {
              data: data.productOptions.map((option) => ({
                name: option.name,
                price: option.price,
                branchId: tokenPayload.branchId,
                isMultiple: option.isMultiple,
                photoURL: option.photoURL,
              })),
            },
          },
        }),
        ...(data.productTypeIds && {
          productTypes: {
            set: data.productTypeIds.map((id) => ({ id })),
          },
        }),
        updatedBy: tokenPayload.accountId,
      },
      where: {
        id: where.id,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
    });

    await this.commonService.createActivityLog(
      [productOptionGroup.id],
      "ProductOptionGroup",
      ACTIVITY_LOG_TYPE.UPDATE,
      tokenPayload,
    );

    return productOptionGroup;
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.productOptionGroup.updateMany({
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

    await this.commonService.createActivityLog(data.ids, "ProductOptionGroup", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
