import { Injectable } from '@nestjs/common';
import {
  CreatePromotionDto,
  ProductAmountDto,
  ProductsOrderDto,
  UpdatePromotionDto,
} from './dto/promotion.dto';
import { FindManyDto } from 'utils/Common.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { calculatePagination } from 'utils/Helps';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class PromotionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
  ) {}

  async create(data: CreatePromotionDto, tokenPayload: TokenPayload) {
    await this.commonService.checkDataExistingInBranch(
      { code: data.code },
      'Promotion',
      tokenPayload.branchId,
    );

    return this.prisma.promotion.create({
      data: {
        name: data.name,
        code: data.code,
        startDate: data.startDate,
        endDate: data.endDate,
        isNoEndDate: data.isNoEndDate,
        amount: data.amount,
        isLimit: data.isLimit,
        amountCustomer: data.amountCustomer,
        isLimitCustomer: data.isLimitCustomer,
        description: data.description,
        value: data.value,
        typeValue: data.typeValue,
        type: data.type,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
        promotionConditions: {
          createMany: {
            data: data.promotionConditions.map((condition) => ({
              productId: condition.productId,
              amount: condition.amount,
              branchId: tokenPayload.accountId,
            })),
          },
        },
        promotionProducts: {
          createMany: {
            data: data.promotionProducts.map((product) => ({
              productId: product.productId,
              amount: product.amount,
              name: product.name,
              photoURL: product.photoURL,
              branchId: tokenPayload.accountId,
            })),
          },
        },
      },
      include: {
        promotionConditions: true,
        promotionProducts: true,
      },
    });
  }

  async findAll(
    params: FindManyDto,
    body: ProductsOrderDto,
    tokenPayload: TokenPayload,
  ) {
    const { skip, take, keyword, isSort } = params;
    const { productsOrder } = body;

    const where: Prisma.PromotionWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
      ...(productsOrder && {
        promotionConditions: {
          some: {
            OR: productsOrder.map((product) => ({
              productId: product.productId,
              amount: {
                lte: product.amount,
              },
            })),
          },
        },
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.promotion.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        include: {
          ...(!isSort && {
            promotionConditions: true,
            promotionProducts: true,
          }),
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

  async findUniq(
    where: Prisma.PromotionWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.promotion.findFirstOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
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
        isNoEndDate: data.isNoEndDate,
        amount: data.amount,
        isLimit: data.isLimit,
        amountCustomer: data.amountCustomer,
        isLimitCustomer: data.isLimitCustomer,
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
                branchId: tokenPayload.accountId,
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
                branchId: tokenPayload.accountId,
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

  async deleteMany(
    where: Prisma.PromotionWhereInput,
    tokenPayload: TokenPayload,
  ) {
    await this.prisma.promotionProduct.updateMany({
      where: {
        isPublic: true,
        promotion: {
          ...where,
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
          ...where,
          isPublic: true,
          branchId: tokenPayload.branchId,
        },
      },
      data: {
        isPublic: false,
      },
    });

    return this.prisma.promotion.updateMany({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }
}
