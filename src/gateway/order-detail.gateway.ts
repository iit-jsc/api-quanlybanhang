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

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      this.server
        .to(branchId)
        .emit('order-details', emitData, accountSocket ? { except: accountSocket.socketId } : {})
    } else {
      this.server.to(branchId).emit('order-details', emitData)
    }
  }
}
