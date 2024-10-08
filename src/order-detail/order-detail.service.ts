import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CommonService } from "src/common/common.service";
import { OrderGateway } from "src/gateway/order.gateway";
import { UpdateOrderProductDto } from "src/order/dto/update-order-detail.dto";
import { CustomHttpException } from "utils/ApiErrors";
import { DeleteManyDto } from "utils/Common.dto";

@Injectable()
export class OrderDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderGateway: OrderGateway,
    private commonService: CommonService,
  ) {}

  async update(
    params: {
      where: Prisma.OrderDetailWhereUniqueInput;
      data: UpdateOrderProductDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    await this.checkOrderPaidByDetailIds([where.id]);

    const productOptions = await this.prisma.productOption.findMany({
      where: {
        id: {
          in: data.productOptionIds,
        },
        isPublic: true,
      },
    });

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
}
