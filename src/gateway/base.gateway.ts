import { PrismaService } from 'nestjs-prisma'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AnyObject } from 'interfaces/common.interface'
import { HttpException, HttpStatus, Req } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway()
export abstract class BaseGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly jwtService: JwtService
  ) {}

  @WebSocketServer() server: Server

  afterInit() {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id)
  }

  async handleDisconnect() {}

  @SubscribeMessage('joinBranch')
  async handleJoinBranch(@ConnectedSocket() client: Socket, @Req() req: AnyObject) {
    const authHeader = this.getAuthHeader(req)

    if (!authHeader) return false

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = authHeader.split(' ')

    if (!token) throw new HttpException('Không tìm thấy token!', HttpStatus.NOT_FOUND)

    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.SECRET_KEY
    })

    console.log(client.id, ' joined: ', payload.branchId)

    client.join(payload.branchId)
  }

  private getAuthHeader(req: AnyObject) {
    const authHeader = req.handshake.headers['authorization']
    return authHeader
  }
}
