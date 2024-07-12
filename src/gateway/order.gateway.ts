import { Req, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { AnyObject, TokenPayload } from 'interfaces/common.interface';
import { Server, Socket } from 'socket.io';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class OrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('Init');
  }

  handleConnection(client: Socket) {
    console.log('### Người dùng kết nối:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('### Người dùng ngắt kết nối:', client.id);
  }

  @SubscribeMessage('joinShop')
  handleJoinShop(
    @ConnectedSocket() client: Socket,
    @Req() req: AnyObject,
  ): void {
    const tokenPayload = req.handshake?.tokenPayload as TokenPayload;

    console.log(
      `### Người dùng ${client.id} đang join vào chi nhánh: ${tokenPayload.branchId}`,
    );

    client.emit('joinedShop', { branchId: tokenPayload.branchId });
  }

  @SubscribeMessage('createOrder')
  handleCreateOrder(client: Socket, payload: any): void {
    console.log('Order created:', payload);
    this.server.emit('orderCreated', payload);
  }
}
