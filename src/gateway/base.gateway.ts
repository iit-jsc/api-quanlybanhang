import { PrismaService } from "nestjs-prisma";
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AnyObject, TokenPayload } from "interfaces/common.interface";
import { Req } from "@nestjs/common";

@WebSocketGateway()
export abstract class BaseGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(protected readonly prisma: PrismaService) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log("WebSocket server initialized");
  }

  handleConnection(client: Socket) {
    console.log("Client connected:", client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log("Client disconnected:", client.id);

    await this.prisma.accountSocket.deleteMany({
      where: {
        socketId: client.id,
      },
    });
  }

  @SubscribeMessage("joinBranch")
  async handleJoinBranch(@ConnectedSocket() client: Socket, @Req() req: AnyObject) {
    const tokenPayload = req.handshake?.tokenPayload as TokenPayload;

    await this.prisma.accountSocket.upsert({
      where: {
        socketId: client.id,
      },
      create: {
        branchId: tokenPayload.branchId,
        shopId: tokenPayload.shopId,
        socketId: client.id,
        accountId: tokenPayload.accountId,
      },
      update: {
        branchId: tokenPayload.branchId,
        shopId: tokenPayload.shopId,
        accountId: tokenPayload.accountId,
      },
    });

    console.log(`Người dùng ${client.id} đang join vào chi nhánh: ${tokenPayload.branchId}`);

    client.emit("joinedBranch", { branchId: tokenPayload.branchId });
  }

  async getAccountsOnline(branchId: string) {
    return await this.prisma.accountSocket.findMany({
      where: {
        branchId: branchId,
      },
      select: {
        socketId: true,
      },
    });
  }
}
