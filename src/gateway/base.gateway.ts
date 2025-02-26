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
import { Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "guards/jwt-auth.guard";

@WebSocketGateway()
export abstract class BaseGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(protected readonly prisma: PrismaService) { }

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    // console.log("WebSocket server initialized");
  }

  handleConnection(client: Socket) {
    console.log("Client connected:", client.id);
  }

  async handleDisconnect(client: Socket) {
    // console.log("Client disconnected:", client.id);
  }

  @SubscribeMessage("joinBranch")
  @UseGuards(JwtAuthGuard)
  async handleJoinBranch(@ConnectedSocket() client: Socket, @Req() req: AnyObject) {
    const tokenPayload = req.handshake?.tokenPayload as TokenPayload;

    client.join(tokenPayload.branchId)
  }

  async getAccountsOnline(branchId: string) {
    return await this.prisma.accountSocket.findMany({
      where: {
        branchId: branchId,
      },
      select: {
        socketId: true,
        accountId: true,
      },
    });
  }
}
