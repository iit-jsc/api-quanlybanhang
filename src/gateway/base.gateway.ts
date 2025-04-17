import { PrismaService } from 'nestjs-prisma'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { HttpException, HttpStatus } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TokenPayload } from 'interfaces/common.interface'

@WebSocketGateway({
  cors: {
    origin: '*',
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

  async handleConnection(client: Socket) {
    try {
      console.log('Client connected:', client.id)
    } catch (error) {
      console.error('Error in handleConnection:', error)
    }
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
  async handleJoinBranch(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { token: string }
  ) {
    try {
      if (!payload?.token) {
        throw new HttpException('Không tìm thấy token!', HttpStatus.NOT_FOUND)
      }

      const token = payload.token

      const decoded: TokenPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY
      })

      // Lấy danh sách các phòng hiện tại của client (bao gồm cả socket.id của chính nó)
      const currentRooms = Array.from(client.rooms)

      console.log(currentRooms, 123)

      // Rời khỏi tất cả các phòng hiện tại, trừ phòng mặc định (socket.id)
      for (const room of currentRooms) {
        if (room !== decoded.branchId) {
          client.leave(room)
          console.log(`Client ${client.id} left room: ${room}`)
        }
      }

      await this.prisma.accountSocket.upsert({
        where: {
          deviceId: decoded.deviceId
        },
        create: {
          accountId: decoded.accountId,
          deviceId: decoded.deviceId,
          branchId: decoded.branchId,
          socketId: client.id
        },
        update: {
          socketId: client.id
        }
      })

      client.join(decoded.branchId)

      console.log('client joined: ', client.id)

      return true
    } catch (error) {
      console.error('Error in handleJoinBranch:', error)
    }
  }
}
