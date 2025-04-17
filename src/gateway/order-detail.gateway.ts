import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { BaseGateway } from './base.gateway'
import { JwtService } from '@nestjs/jwt'
@WebSocketGateway()
export class OrderDetailGateway extends BaseGateway {
  constructor(prisma: PrismaService, jwtService: JwtService) {
    super(prisma, jwtService)
  }

  async handleModifyOrderDetail(payload: any, branchId: string, deviceId: string) {
    const emitData = Array.isArray(payload) ? payload : [payload]

    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit('order-details', emitData)
        return
      }
    }

    target.emit('order-details', emitData)
  }
}
