import { Order } from '@prisma/client'
import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { BaseGateway } from './base.gateway'
import { JwtService } from '@nestjs/jwt'
@WebSocketGateway()
export class OrderGateway extends BaseGateway {
  constructor(prisma: PrismaService, jwtService: JwtService) {
    super(prisma, jwtService)
  }

  async handleModifyOrder(payload: Order, branchId: string, deviceId: string) {
    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit('order', payload)
        return
      }
    }

    target.emit('order', payload)
  }
}
