import { Injectable } from '@nestjs/common'
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { DeleteManyResponse, TokenPayload } from 'interfaces/common.interface'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { customPaginate, removeDiacritics } from 'utils/Helps'
import { CommonService } from 'src/common/common.service'
import { ACTIVITY_LOG_TYPE, PROMOTION_TYPE } from 'enums/common.enum'
import { FindManyPromotionDto } from './dto/find-many.dto'

@Injectable()
export class PromotionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService
  ) {}

  async create(data: CreatePromotionDto, tokenPayload: TokenPayload) {
    const result = await this.prisma.promotion.create({
      data: {
        name: data.name,
        code: data.code,
        startDate: data.startDate,
        endDate: data.endDate,
        isEndDateDisabled: data.isEndDateDisabled,
        amount: data.amount,
        maxValue: data.maxValue,
        isActive: data.isActive,
        description: data.description,
        discount: data.discount,
        discountType: data.discountType,
        type: data.type,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
        ...(data.promotionConditions?.length > 0 && {
          promotionConditions: {
            createMany: {
              data: data.promotionConditions.map(condition => ({
                productId: condition.productId,
                amount: condition.amount,
                branchId: tokenPayload.branchId
              }))
            }
          }
        }),
        ...(data.promotionProducts?.length > 0 &&
          data.type == PROMOTION_TYPE.GIFT && {
            promotionProducts: {
              createMany: {
                data: data.promotionProducts.map(product => ({
                  productId: product.productId,
                  amount: product.amount,
                  name: product.name,
                  photoURL: product.photoURL,
                  branchId: tokenPayload.branchId
                }))
              }
            }
          })
      },
      include: {
        promotionConditions: true,
        promotionProducts: true
      }
    })

    await this.commonService.createActivityLog(
      [result.id],
      'Promotion',
      ACTIVITY_LOG_TYPE.CREATE,
      tokenPayload
    )

    return result
  }

  async findAll(params: FindManyPromotionDto) {
    const {
      page,
      perPage,
      keyword,
      isSort,
      branchId,
      orderBy,
      orderProducts,
      types,
      isActive
    } = params

    const where: Prisma.PromotionWhereInput = {
      isPublic: true,
      branchId: branchId,
      ...(keyword && { name: { contains: removeDiacritics(keyword) } }),
      ...(orderProducts && {
        startDate: {
          lte: new Date(new Date().setHours(23, 59, 59, 999))
        },
        AND: [
          {
            OR: [
              orderProducts && {
                promotionConditions: {
                  some: {
                    OR: this.commonService
                      .aggregateOrderProducts(orderProducts)
                      .map(orderDetail => ({
                        productId: orderDetail.productId,
                        amount: {
                          lte: orderDetail.amount
                        }
                      }))
                  }
                }
              },
              {
                promotionConditions: {
                  none: {}
                }
              }
            ]
          },
          {
            OR: [
              {
                endDate: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              },
              {
                isEndDateDisabled: true
              }
            ]
          },
          {
            isActive: true
          }
        ]
      }),
      ...(types?.length > 0 && { type: { in: types } }),
      ...(typeof isActive !== 'undefined' && { isActive: isActive })
    }

    return await customPaginate(
      this.prisma.promotion,
      {
        orderBy: orderBy || { createdAt: 'desc' },
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
                    id: true
                  }
                },
                amount: true
              },
              where: {
                isPublic: true
              }
            },
            promotionProducts: {
              select: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    photoURLs: true,
                    slug: true
                  }
                },
                amount: true,
                name: true,
                photoURL: true
              },
              where: {
                isPublic: true
              }
            }
          })
        }
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(where: Prisma.PromotionWhereUniqueInput) {
    return this.prisma.promotion.findFirstOrThrow({
      where: {
        ...where,
        isPublic: true
      },
      include: {
        promotionConditions: {
          include: {
            product: {
              select: {
                name: true,
                code: true,
                photoURLs: true,
                thumbnail: true,
                slug: true,
                id: true
              }
            }
          },
          where: {
            isPublic: true
          }
        },
        promotionProducts: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                code: true,
                photoURLs: true,
                thumbnail: true,
                slug: true
              }
            }
          },
          where: {
            isPublic: true
          }
        }
      }
    })
  }

  async update(
    params: {
      where: Prisma.PromotionWhereUniqueInput
      data: UpdatePromotionDto
    },
    tokenPayload: TokenPayload
  ) {
    const { where, data } = params

    const result = await this.prisma.promotion.update({
      data: {
        name: data.name,
        code: data.code,
        startDate: data.startDate,
        endDate: data.endDate,
        maxValue: data.maxValue,
        isEndDateDisabled: data.isEndDateDisabled,
        amount: data.amount,
        isActive: data.isActive,
        description: data.description,
        discount: data.discount,
        discountType: data.discountType,
        type: data.type,
        ...(data.promotionConditions && {
          promotionConditions: {
            deleteMany: {
              promotionId: where.id
            },
            createMany: {
              data: data.promotionConditions.map(condition => ({
                productId: condition.productId,
                amount: condition.amount,
                branchId: tokenPayload.branchId
              }))
            }
          }
        }),
        ...(data.promotionProducts && {
          promotionProducts: {
            deleteMany: {
              promotionId: where.id
            },
            createMany: {
              data: data.promotionProducts.map(product => ({
                productId: product.productId,
                amount: product.amount,
                name: product.name,
                photoURL: product.photoURL,
                branchId: tokenPayload.branchId
              }))
            }
          }
        }),
        branchId: tokenPayload.branchId,
        updatedBy: tokenPayload.accountId
      },
      where: {
        isPublic: true,
        id: where.id,
        branchId: tokenPayload.branchId
      },
      include: {
        promotionConditions: true,
        promotionProducts: true
      }
    })

    await this.commonService.createActivityLog(
      [result.id],
      'Promotion',
      ACTIVITY_LOG_TYPE.UPDATE,
      tokenPayload
    )

    return result
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    await this.prisma.promotionProduct.updateMany({
      where: {
        isPublic: true,
        promotion: {
          id: {
            in: data.ids
          },
          isPublic: true,
          branchId: tokenPayload.branchId
        }
      },
      data: {
        isPublic: false
      }
    })

    await this.prisma.promotionCondition.updateMany({
      where: {
        isPublic: true,
        promotion: {
          id: {
            in: data.ids
          },
          isPublic: true,
          branchId: tokenPayload.branchId
        }
      },
      data: {
        isPublic: false
      }
    })

    const count = await this.prisma.promotion.updateMany({
      where: {
        id: {
          in: data.ids
        },
        isPublic: true,
        branchId: tokenPayload.branchId
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId
      }
    })

    await this.commonService.createActivityLog(
      data.ids,
      'Promotion',
      ACTIVITY_LOG_TYPE.DELETE,
      tokenPayload
    )

    return { ...count, ids: data.ids } as DeleteManyResponse
  }
}
