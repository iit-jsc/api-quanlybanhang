import { UseGuards } from "@nestjs/common";
import { WebSocketGateway } from "@nestjs/websockets";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { PrismaService } from "nestjs-prisma";
import { Order } from "@prisma/client";
import { BaseGateway } from "./base.gateway";
@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class OrderGateway extends BaseGateway {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  async handleModifyOrder(payload: Order) {
    const accountOnline = await this.getAccountsOnline(payload.branchId);

    const socketIds = accountOnline
      .filter((account) => account.accountId !== payload.createdBy)
      .map((account) => account.socketId);

    if (socketIds.length > 0) {
      // console.log(`Đơn hàng ${payload.id} đã gửi socket cho: ${socketIds}`);

      this.server.to(socketIds).emit("order", payload);
    }
  }
}
