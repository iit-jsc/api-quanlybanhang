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
  ) { }

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
              colors: option.colors,
              isDefault: option.isDefault,
              branchId: tokenPayload.branchId,
              photoURL: option.photoURL,
              createdBy: tokenPayload.accountId,
            })),
          },
        },
        isMultiple: data.isMultiple,
        isRequired: data.isRequired,
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
        select: {
          id: true,
          name: true,
          isMultiple: true,
          isRequired: true,
          productOptions: {
            select: {
              id: true,
              name: true,
              price: true,
              productOptionGroupId: true,
              isDefault: true,
              photoURL: true,
              colors: true,
              updatedAt: true,
            },
            where: {
              isPublic: true
            },
            orderBy: {
              createdAt: "asc"
            }
          },
          updatedAt: true,
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
        productOptions: {
          where: {
            isPublic: true
          },
          orderBy: {
            createdAt: "asc"
          }
        },
      },
    });
  }

  async update(
    params: { where: Prisma.ProductOptionGroupWhereUniqueInput; data: UpdateProductOptionGroupDto },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      if (data.productOptions) {
        this.validateDefaultProductOptions(data.productOptions);

        await this.updateProductOption(data.productOptions, where.id, tokenPayload, prisma)
      }

      const productOptionGroup = await prisma.productOptionGroup.update({
        data: {
          name: data.name,
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
          productOptions: {
            where: {
              isPublic: true
            }
          },
        },
      });

      await this.commonService.createActivityLog(
        [productOptionGroup.id],
        "ProductOptionGroup",
        ACTIVITY_LOG_TYPE.UPDATE,
        tokenPayload,
      );

      return productOptionGroup;
    })
  }

  async updateProductOption(
    data: CreateProductOptionDto[],
    productOptionGroupId: string,
    tokenPayload: TokenPayload,
    prisma?: PrismaClient
  ) {
    const idsToKeep = data.filter(option => option.id).map(option => option.id);
    prisma = prisma || this.prisma;

    await prisma.productOption.updateMany({
      where: {
        id: { notIn: idsToKeep },
        productOptionGroupId: productOptionGroupId,
        branchId: tokenPayload.branchId,
        isPublic: true
      },
      data: {
        updatedBy: tokenPayload.accountId,
        isPublic: false
      }
    });

    const operations = data.map(option => {
      if (option.id) {
        return prisma.productOption.update({
          where: {
            id: option.id,
            branchId: tokenPayload.branchId,
            productOptionGroupId,
            isPublic: true,
          },
          data: {
            name: option.name,
            price: option.price,
            colors: option.colors,
            photoURL: option.photoURL,
            isDefault: option.isDefault,
            updatedBy: tokenPayload.accountId,
          },
        });
      } else {
        return prisma.productOption.create({
          data: {
            productOptionGroupId,
            name: option.name,
            price: option.price,
            photoURL: option.photoURL,
            colors: option.colors,
            isDefault: option.isDefault,
            createdBy: tokenPayload.accountId,
            branchId: tokenPayload.branchId,
          },
        });
      }
    });

    await Promise.all(operations);
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      await prisma.productOption.updateMany({
        where: {
          isPublic: true,
          productOptionGroup: {
            id: {
              in: data.ids
            }
          }
        }, data: {
          isPublic: false,
          updatedBy: tokenPayload.accountId,
        }
      })

      const count = await prisma.productOptionGroup.updateMany({
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
    })

  }

  validateDefaultProductOptions(productOptions: CreateProductOptionDto[]) {
    const defaultCount = productOptions.filter((option) => option.isDefault === true).length;

    if (defaultCount > 1) throw new CustomHttpException(HttpStatus.CONFLICT, "Chỉ có duy nhất dữ liệu là mặc định!");
  }
}
