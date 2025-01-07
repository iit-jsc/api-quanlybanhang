import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CreateDiscountIssueDto, FindManyDiscountIssueDto, findUniqByDiscountCodeDto, UpdateDiscountIssueDto } from "./dto/discount-issue.dto";
import { DeleteManyDto } from "utils/Common.dto";
import { customPaginate } from "utils/Helps";
import { CommonService } from "src/common/common.service";
import { ACTIVITY_LOG_TYPE } from "enums/common.enum";
import { CustomHttpException } from "utils/ApiErrors";

@Injectable()
export class DiscountIssueService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) { }

  async create(data: CreateDiscountIssueDto, tokenPayload: TokenPayload) {
    if (data.endDate && data.startDate && data.endDate < data.startDate)
      throw new CustomHttpException(HttpStatus.CONFLICT, "Ngày kết thúc không hợp lệ!");

    const discountIssue = await this.prisma.discountIssue.create({
      data: {
        name: data.name,
        code: data.code,
        discountType: data.discountType,
        discount: data.discount,
        startDate: data.startDate,
        endDate: data.endDate,
        isEndDateDisabled: data.isEndDateDisabled,
        description: data.description,
        amount: data.amount,
        isLimit: data.isLimit,
        minTotalOrder: data.minTotalOrder,
        maxValue: data.maxValue,
        branchId: tokenPayload.branchId,
        createdBy: tokenPayload.accountId,
      },
    });

    await this.commonService.createActivityLog(
      [discountIssue.id],
      "DiscountIssue",
      ACTIVITY_LOG_TYPE.CREATE,
      tokenPayload,
    );

    return discountIssue;
  }

  async update(
    params: {
      where: Prisma.DiscountIssueWhereUniqueInput;
      data: UpdateDiscountIssueDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    if (data.endDate && data.startDate && data.endDate < data.startDate)
      throw new CustomHttpException(HttpStatus.CONFLICT, "Ngày kết thúc không hợp lệ!");

    const discountIssue = await this.prisma.discountIssue.update({
      data: {
        name: data.name,
        code: data.code,
        discountType: data.discountType,
        discount: data.discount,
        startDate: data.startDate,
        endDate: data.endDate,
        isEndDateDisabled: data.isEndDateDisabled,
        description: data.description,
        amount: data.amount,
        isLimit: data.isLimit,
        minTotalOrder: data.minTotalOrder,
        maxValue: data.maxValue,
        branchId: tokenPayload.branchId,
        updatedBy: tokenPayload.accountId,
      },
      where: { id: where.id, isPublic: true, branchId: tokenPayload.branchId },
    });

    await this.commonService.createActivityLog(
      [discountIssue.id],
      "DiscountIssue",
      ACTIVITY_LOG_TYPE.UPDATE,
      tokenPayload,
    );

    return discountIssue;
  }

  async findAll(params: FindManyDiscountIssueDto, tokenPayload: TokenPayload) {
    let { page, perPage, keyword, orderBy, totalOrder } = params;
    let where: Prisma.DiscountIssueWhereInput = {
      isPublic: true,
      ...(keyword && { name: { contains: keyword } }),
      branchId: tokenPayload.branchId,
      ...(totalOrder && {
        minTotalOrder: {
          lte: totalOrder
        }
      })
    };

    return await customPaginate(
      this.prisma.discountIssue,
      {
        orderBy: orderBy || { createdAt: "desc" },
        where,
        include: {
          _count: {
            select: {
              discountCodes: {
                where: {
                  isPublic: true
                },
              }
            }
          }
        }
      },
      {
        page,
        perPage,
      },
    );
  }

  async findUniq(where: Prisma.DiscountIssueWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.discountIssue.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      include: {
        _count: {
          select: {
            discountCodes: {
              where: {
                isPublic: true
              },
            }
          }
        }
      }
    });
  }

  async findByDiscountCode(data: findUniqByDiscountCodeDto) {
    const { branchId, code } = data

    if(!branchId) throw new CustomHttpException(HttpStatus.NOT_FOUND, "Chi nhánh không được để trống!");

    const discountIssue = await this.prisma.discountIssue.findFirst({
      where: {
        branchId: branchId,
        isPublic: true,
        startDate: {
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        AND: [
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
        discountCodes: {
          some: {
            code: code,
            isUsed: false,
            isPublic: true,
          },
        },
      },
    });

    if (!discountIssue) throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy khuyến mãi!");

    return discountIssue;
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const count = await prisma.discountIssue.updateMany({
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

      await prisma.discountCode.updateMany({
        where: {
          discountIssue: {
            id: {
              in: data.ids
            }
          },
          isPublic: true,
        },
        data: {
          isPublic: false,
          updatedBy: tokenPayload.accountId
        }
      })

      await this.commonService.createActivityLog(data.ids, "DiscountIssue", ACTIVITY_LOG_TYPE.DELETE, tokenPayload);

      return { ...count, ids: data.ids } as DeleteManyResponse;
    })
  }
}
