import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { Table } from '@prisma/client'
import { BaseGateway } from './base.gateway'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway()
export class TableGateway extends BaseGateway {
  constructor(prisma: PrismaService, jwtService: JwtService) {
    super(prisma, jwtService)
  }

  async handleAddDish(payload: Table | Table[], branchId: string, deviceId?: string) {
    const emitData = Array.isArray(payload) ? payload : [payload]

    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit('add-dish-to-table', emitData)
        return
      }
    }

    target.emit('add-dish-to-table', emitData)
  }
}
