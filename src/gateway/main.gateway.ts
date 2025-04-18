import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { PrismaService } from 'nestjs-prisma'
import { JwtService } from '@nestjs/jwt'
import { CustomerRequest } from '@prisma/client'
import { TokenPayload } from 'interfaces/common.interface'
import { TableGatewayHandler } from './handlers/table.handler'
import { NotifyGatewayHandler } from './handlers/notify.handler'
import { OrderDetailGatewayHandler } from './handlers/order-detail-gateway.handler'
import { OrderGatewayHandler } from './handlers/order-gateway.handler'

@WebSocketGateway({
  cors: true,
  transports: ['websocket'],
  allowUpgrades: true,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: false
  }
})
export class MainGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly tableHandler: TableGatewayHandler,
    private readonly notifyGatewayHandler: NotifyGatewayHandler,
    private readonly orderDetailGatewayHandler: OrderDetailGatewayHandler,
    private readonly orderGatewayHandler: OrderGatewayHandler
  ) {}

  afterInit() {
    this.tableHandler.setServer(this.server)
    this.notifyGatewayHandler.setServer(this.server)
    this.orderDetailGatewayHandler.setServer(this.server)
    this.orderGatewayHandler.setServer(this.server)
  }

  async handleConnection(client: Socket) {
    try {
      console.log(`[${client.id}] đã kết nối`)

      setTimeout(() => {
        if (client.id) {
          this.server.to(client.id).emit('socket-status', '✅ Kết nối thành công')
        }
      }, 100)
    } catch (error) {
      console.error('Error in handleConnection (recovery):', error)
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      console.log(`[${client.id}] đã ngắt kết nối`)

      await this.prisma.accountSocket.delete({
        where: { socketId: client.id }
      })

      this.server.to(client.id).emit('socket-status', '🔴 Đã ngắt kết nối')
    } catch (error) {
      if (error.code === 'P2025') {
        console.warn(`Chưa join branch [${client.id}], bỏ qua delete account socket.`)
      } else {
        console.error('Error in handleDisconnect:', error)
      }
    }
  }

  @SubscribeMessage('joinBranch')
  async handleJoinBranch(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { token: string }
  ) {
    try {
      if (!payload?.token) {
        throw new Error('Token not found!')
      }

      const decoded: TokenPayload = await this.jwtService.verifyAsync(payload.token, {
        secret: process.env.SECRET_KEY
      })

      const rooms = Array.from(client.rooms).filter(
        room => room !== client.id && room !== decoded.branchId
      )

      for (const room of rooms) {
        client.leave(room)
      }

      const existing = await this.prisma.accountSocket.findFirst({
        where: {
          OR: [{ socketId: client.id }, { deviceId: decoded.deviceId }]
        }
      })

      const accountSocket = existing
        ? await this.prisma.accountSocket.update({
            where: { socketId: existing.socketId },
            data: { branchId: decoded.branchId, socketId: client.id, deviceId: decoded.deviceId },
            select: {
              branch: { select: { name: true } }
            }
          })
        : await this.prisma.accountSocket.create({
            data: {
              accountId: decoded.accountId,
              deviceId: decoded.deviceId,
              branchId: decoded.branchId,
              socketId: client.id
            },
            select: {
              branch: { select: { name: true } }
            }
          })

      console.log(`[${client.id}] đã join [${decoded.branchId}]`)

      this.server
        .to(client.id)
        .emit('socket-status', `Join thành công vào ${accountSocket.branch.name}`)
    } catch (error) {
      console.error('Error in handleJoinBranch:', error)
      return { success: false, error: error.message }
    }
  }

  async handleCreateCustomerRequest(payload: CustomerRequest) {
    this.server.to(payload.branchId).emit('customer-request', payload)
  }
}
