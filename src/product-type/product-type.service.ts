import { CommonService } from "src/common/common.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { customPaginate, removeDiacritics } from "utils/Helps";
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
        ...(data.productOptionGroupIds && {
          productOptionGroups: {
            connect: data.productOptionGroupIds.map((id) => ({ id }))
          }
        }),
        ...(data.productOptionIds && {
          productOptions: {
            connect: data.productOptionIds.map((id) => ({ id }))
          }
        }),
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
    let { page, perPage, keyword, branchId, orderBy } = params;

    const keySearch = ["name", "slug"];

    let where: Prisma.ProductTypeWhereInput = {
      isPublic: true,
      branchId: branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: removeDiacritics(keyword) },
        })),
      }),
    };

    return await customPaginate(
      this.prisma.productType,
      {
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
              branchId
            },
          },
          updatedAt: true,
        },
      },
      {
        page,
        perPage,
      },
    );

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
        productOptionGroups: {
          where: {
            isPublic: true,
            productTypes: {
              some: {
                id: where.id,
                branchId: where.branchId,
              }
            }
          },
          select: {
            id: true,
            name: true,
            isMultiple: true,
            isRequired: true,
            updatedAt: true,
            productOptions: {
              where: {
                isPublic: true,
                productTypes: {
                  some: {
                    id: where.id,
                    branchId: where.branchId,
                  }
                },
              },
            }
          }
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
        ...(data.productOptionGroupIds && {
          productOptionGroups: {
            set: data.productOptionGroupIds.map((id) => ({ id }))
          }
        }),
        ...(data.productOptionIds && {
          productOptions: {
            set: data.productOptionIds.map((id) => ({ id }))
          }
        }),
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
