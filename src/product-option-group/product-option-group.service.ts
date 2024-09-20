import { ProductOptionGroupController } from "./product-option-group.controller";
import { ProductOptionGroupModule } from "./product-option-group.module";
import { HttpStatus, Injectable } from "@nestjs/common";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CommonService } from "src/common/common.service";
import { CreateSupplierTypeDto } from "src/supplier-type/dto/supplier-type.dto";
import {
  CreateProductOptionDto,
  CreateProductOptionGroupDto,
  UpdateProductOptionGroupDto,
} from "./dto/product-option-group.dto";
import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { calculatePagination } from "utils/Helps";
import { CustomHttpException } from "utils/ApiErrors";

@Injectable()
export class ProductOptionGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
  ) {}

  async create(data: CreateProductOptionGroupDto, tokenPayload: TokenPayload) {
    this.validateDefaultProductOptions(data.productOptions);

    const result = await this.prisma.productOptionGroup.create({
      data: {
        name: data.name,
        productOptions: {
          createMany: {
            data: data.productOptions.map((option) => ({
              name: option.name,
              price: option.price,
              isDefault: option.isDefault,
              branchId: tokenPayload.branchId,
              photoURL: option.photoURL,
              createdBy: tokenPayload.accountId,
            })),
          },
        },
        isMultiple: data.isMultiple,
        isRequired: data.isRequired,
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

  async findAll(params: FindManyDto, branchId: string) {
    let { skip, take, keyword, orderBy, productTypeIds } = params;

    let where: Prisma.ProductOptionGroupWhereInput = {
      isPublic: true,
      branchId: branchId,
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

  async findUniq(where: Prisma.ProductOptionGroupWhereUniqueInput) {
    return this.prisma.productOptionGroup.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
      },
      include: {
        productOptions: true,
        productTypes: true,
      },
    });
  }

  async update(
    params: { where: Prisma.ProductOptionGroupWhereUniqueInput; data: UpdateProductOptionGroupDto },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    if (data.productOptions) this.validateDefaultProductOptions(data.productOptions);

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
                photoURL: option.photoURL,
                isDefault: option.isDefault,
                updatedBy: tokenPayload.accountId,
              })),
            },
          },
        }),
        ...(data.productTypeIds && {
          productTypes: {
            set: data.productTypeIds.map((id) => ({ id })),
          },
        }),
        isMultiple: data.isMultiple,
        isRequired: data.isRequired,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        id: where.id,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      include: {
        productOptions: true,
        productTypes: true,
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

  validateDefaultProductOptions(productOptions: CreateProductOptionDto[]) {
    const defaultCount = productOptions.filter((option) => option.isDefault === true).length;

    if (defaultCount > 1) throw new CustomHttpException(HttpStatus.CONFLICT, "Chỉ có duy nhất dữ liệu là mặc định!");
  }
}
