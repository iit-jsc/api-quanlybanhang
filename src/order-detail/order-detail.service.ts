import { Prisma } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";
import { HttpStatus, Injectable } from "@nestjs/common";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { UpdateOrderProductDto } from "src/order/dto/update-order-detail.dto";
import { CustomHttpException } from "utils/ApiErrors";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { calculatePagination, customPaginate } from "utils/Helps";
import { PER_PAGE } from "enums/common.enum";
import { paginator, PaginatorTypes } from "@nodeteam/nestjs-prisma-pagination";
import { FindManyOrderDetailDto } from "./dto/order-detail.dto";
const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: PER_PAGE });

@Injectable()
export class OrderDetailService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async update(
    params: {
      where: Prisma.OrderDetailWhereUniqueInput;
      data: UpdateOrderProductDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    let productOptions = null;
    await this.checkOrderPaidByDetailIds([where.id]);

    if (Array.isArray(data.productOptionIds)) {
      productOptions = await this.prisma.productOption.findMany({
        where: {
          id: {
            in: data.productOptionIds,
          },
          isPublic: true,
        },
      });
    }

    const orderDetail = await this.prisma.orderDetail.update({
      where: {
        id: where.id,
        branch: {
          isPublic: true,
          id: tokenPayload.branchId,
        },
      },
      data: {
        amount: data.amount,
        status: data.status,
        note: data.note,
        ...(productOptions && { productOptions: productOptions }),
        updatedBy: tokenPayload.accountId,
      },
      include: {
        order: true,
      },
    });

    return orderDetail;
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    await this.checkOrderPaidByDetailIds(data.ids);

    const count = await this.prisma.orderDetail.updateMany({
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

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }

  async checkOrderPaidByDetailIds(orderDetailIds: string[]) {
    const order = await this.prisma.order.findFirst({
      where: {
        orderDetails: {
          some: {
            id: {
              in: orderDetailIds,
            },
            isPublic: true,
          },
        },
        isPaid: true,
      },
      select: {
        id: true,
      },
    });

    if (order) throw new CustomHttpException(HttpStatus.CONFLICT, "Đơn hàng này không thể cập nhật vì đã thanh toán!");
  }

  async findAll(params: FindManyOrderDetailDto, tokenPayload: TokenPayload) {
    let { page, perPage, orderBy, orderDetailStatuses, orderTypes, hasTable, from, to } = params;

    const where: Prisma.OrderDetailWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(from && to && {
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      }),
      ...(from && !to && {
        createdAt: {
          gte: new Date(from),
        },
      }),
      ...(!from && to && {
        createdAt: {
          lte: new Date(to),
        },
      }),
      ...(orderDetailStatuses && {
        status: {
          in: orderDetailStatuses
        }
      }),
      ...(orderTypes && {
        order: {
          orderType: { in: orderTypes },
        },
      }),
      ...(typeof hasTable !== 'undefined' && {
        tableId: {
          not: null
        }
      }),
    };

    return await customPaginate(
      this.prisma.orderDetail,
      {
        orderBy: orderBy || { createdAt: "desc" },
        where,
        select: {
          id: true,
          product: true,
          status: true,
          note: true,
          amount: true,
          productOptions: true,
          table: {
            select: {
              id: true,
              name: true,
              area: {
                select: {
                  id: true,
                  name: true,
                  photoURL: true
                },
                where: {
                  isPublic: true
                }
              }
            },
            where: {
              isPublic: true
            }
          },
          order: {
            select: {
              id: true,
              code: true,
              orderType: true,
              createdAt: true
            }
          },
          updatedAt: true,
          createdAt: true,
        },
      },
      {
        page,
        perPage,
      },
    );
  }
}
