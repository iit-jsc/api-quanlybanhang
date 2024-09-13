import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DeleteManyResponse, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CommonService } from "src/common/common.service";
import { OrderGateway } from "src/gateway/order.gateway";
import { UpdateOrderProductDto } from "src/order/dto/update-order-detail.dto";
import { DeleteManyDto } from "utils/Common.dto";

@Injectable()
export class OrderDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderGateway: OrderGateway,
    private commonService: CommonService,
  ) {}

  async updateOrderDetail(
    params: {
      where: Prisma.OrderDetailWhereUniqueInput;
      data: UpdateOrderProductDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    const order = await this.prisma.order.findFirst({
      where: {
        orderDetails: {
          some: {
            id: where.id,
            isPublic: true,
          },
        },
      },
      select: {
        id: true,
      },
    });

    await this.commonService.checkOrderChange(order.id);

    const orderDetail = await this.prisma.orderDetail.update({
      where: {
        id: where.id,
        branch: {
          isPublic: true,
          id: tokenPayload.branchId,
        },
      },
      data: {
        // productId: data.productId,
        amount: data.amount,
        note: data.note,
        status: data.status,
        updatedBy: tokenPayload.accountId,
      },
      include: {
        order: true,
      },
    });

    // Gửi socket
    // await this.orderGateway.handleModifyOrder(orderDetail.order);

    return orderDetail;
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const order = await this.prisma.order.findFirst({
      where: {
        orderDetails: {
          some: {
            id: { in: data.ids },
            isPublic: true,
          },
        },
        branchId: tokenPayload.branchId,
      },
      select: {
        id: true,
      },
    });

    await this.commonService.checkOrderChange(order.id);

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
}
