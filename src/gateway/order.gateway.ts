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
    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      this.server
        .to(branchId)
        .emit('order', payload, accountSocket ? { except: accountSocket.socketId } : {})
    } else {
      this.server.to(branchId).emit('order', payload)
    }
  }
}
