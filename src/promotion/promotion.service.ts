import { Injectable } from "@nestjs/common";
import { CreatePromotionDto, ProductsOrderDto, UpdatePromotionDto } from "./dto/promotion.dto";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { TokenPayload } from "interfaces/common.interface";
import { Prisma } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";
import { calculatePagination } from "utils/Helps";
import { CommonService } from "src/common/common.service";
import { PROMOTION_TYPE } from "enums/common.enum";
import { FindManyPromotionDto } from "./dto/find-many.dto";

@Injectable()
export class PromotionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
  ) {}

  async create(data: CreatePromotionDto, tokenPayload: TokenPayload) {
    await this.commonService.checkDataExistingInBranch({ code: data.code }, "Promotion", tokenPayload.branchId);

    return this.prisma.promotion.create({
      data: {
        name: data.name,
        code: data.code,
        startDate: data.startDate,
        endDate: data.endDate,
        isEndDateDisabled: data.isEndDateDisabled,
        amount: data.amount,
        isLimit: data.isLimit,
        description: data.description,
        value: data.value,
        typeValue: data.typeValue,
        type: data.type,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
        ...(data.promotionConditions?.length > 0 && {
          promotionConditions: {
            createMany: {
              data: data.promotionConditions.map((condition) => ({
                productId: condition.productId,
                amount: condition.amount,
                branchId: tokenPayload.branchId,
              })),
            },
          },
        }),
        ...(data.promotionProducts?.length > 0 &&
          data.type == PROMOTION_TYPE.GIFT && {
            promotionProducts: {
              createMany: {
                data: data.promotionProducts.map((product) => ({
                  productId: product.productId,
                  amount: product.amount,
                  name: product.name,
                  photoURL: product.photoURL,
                  branchId: tokenPayload.branchId,
                })),
              },
            },
          }),
      },
      include: {
        promotionConditions: true,
        promotionProducts: true,
      },
    });
  }

  async findAll(params: FindManyPromotionDto, body: ProductsOrderDto) {
    const { skip, take, keyword, isSort, branchId } = params;
    const { orderProducts } = body;

    const where: Prisma.PromotionWhereInput = {
      isPublic: true,
      branchId: branchId,
      ...(keyword && { name: { contains: keyword, mode: "insensitive" } }),
      ...(orderProducts && {
        startDate: {
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        AND: [
          {
            OR: [
              {
                promotionConditions: {
                  some: {
                    OR: orderProducts.map((orderDetail) => ({
                      productId: orderDetail.productId,
                      amount: {
                        lte: orderDetail.amount,
                      },
                    })),
                  },
                },
              },
              {
                promotionConditions: {
                  none: {},
                },
              },
            ],
          },
          {
            OR: [
              {
                endDate: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
              {
                isEndDateDisabled: true,
              },
            ],
          },
        ],
      }),
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.promotion.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        where,
        include: {
          ...(!isSort && {
            promotionConditions: {
              select: {
                product: {
                  select: {
                    name: true,
                    code: true,
                    photoURLs: true,
                    slug: true,
                    id: true,
                  },
                },
                amount: true,
              },
            },
            promotionProducts: {
              select: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    photoURLs: true,
                    slug: true,
                  },
                },
                amount: true,
                name: true,
                photoURL: true,
              },
            },
          }),
          _count: {
            select: { orders: true },
          },
        },
      }),
      this.prisma.promotion.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.PromotionWhereUniqueInput) {
    return this.prisma.promotion.findFirstOrThrow({
      where: {
        ...where,
        isPublic: true,
      },
      include: {
        promotionConditions: true,
        promotionProducts: true,
      },
    });
  }

  async update(
    params: {
      where: Prisma.PromotionWhereUniqueInput;
      data: UpdatePromotionDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.promotion.update({
      data: {
        name: data.name,
        code: data.code,
        startDate: data.startDate,
        endDate: data.endDate,
        isEndDateDisabled: data.isEndDateDisabled,
        amount: data.amount,
        isLimit: data.isLimit,
        description: data.description,
        value: data.value,
        typeValue: data.typeValue,
        type: data.type,
        ...(data.promotionConditions?.length > 0 && {
          promotionConditions: {
            deleteMany: {
              promotionId: where.id,
            },
            createMany: {
              data: data.promotionConditions.map((condition) => ({
                productId: condition.productId,
                amount: condition.amount,
                branchId: tokenPayload.branchId,
              })),
            },
          },
        }),
        ...(data.promotionProducts?.length > 0 && {
          promotionProducts: {
            deleteMany: {
              promotionId: where.id,
            },
            createMany: {
              data: data.promotionProducts.map((product) => ({
                productId: product.productId,
                amount: product.amount,
                name: product.name,
                photoURL: product.photoURL,
                branchId: tokenPayload.branchId,
              })),
            },
          },
        }),
        branchId: tokenPayload.branchId,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        isPublic: true,
        id: where.id,
        branchId: tokenPayload.branchId,
      },
      include: {
        promotionConditions: true,
        promotionProducts: true,
      },
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    await this.prisma.promotionProduct.updateMany({
      where: {
        isPublic: true,
        promotion: {
          id: {
            in: data.ids,
          },
          isPublic: true,
          branchId: tokenPayload.branchId,
        },
      },
      data: {
        isPublic: false,
      },
    });

    await this.prisma.promotionCondition.updateMany({
      where: {
        isPublic: true,
        promotion: {
          id: {
            in: data.ids,
          },
          isPublic: true,
          branchId: tokenPayload.branchId,
        },
      },
      data: {
        isPublic: false,
      },
    });

    const count = await this.prisma.promotion.updateMany({
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

    return { ...count, ids: data.ids };
  }
}
