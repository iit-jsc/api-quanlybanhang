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

@WebSocketGateway({
  cors: {
    origin: '*', // Hoặc domain cụ thể của Postman
    methods: ['GET', 'POST'],
    credentials: true
  }
})
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

  async handleDisconnect(client: Socket) {
    try {
      await this.prisma.accountSocket.delete({
        where: {
          socketId: client.id
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  @SubscribeMessage('joinBranch')
  async handleJoinBranch(@ConnectedSocket() client: Socket, @Req() req: AnyObject) {
    try {
      const authHeader = this.getAuthHeader(req)

      if (!authHeader) return false

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, token] = authHeader.split(' ')

      if (!token) throw new HttpException('Không tìm thấy token!', HttpStatus.NOT_FOUND)

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY
      })

      await this.prisma.accountSocket.upsert({
        where: {
          deviceId: payload.deviceId
        },
        create: {
          accountId: payload.accountId,
          deviceId: payload.deviceId,
          branchId: payload.branchId,
          socketId: client.id
        },
        update: {
          socketId: client.id
        }
      })

      client.join(payload.branchId)
    } catch (error) {
      console.log(error)
    }
  }

  private getAuthHeader(req: AnyObject) {
    const authHeader = req.handshake.headers['authorization']
    return authHeader
  }
}
