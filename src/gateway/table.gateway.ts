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

  async handleModifyTable(payload: Table, branchId: string, deviceId?: string) {
    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      this.server
        .to(branchId)
        .emit('table', payload, accountSocket ? { except: accountSocket.socketId } : {})
    } else {
      this.server.to(branchId).emit('table', payload)
    }
  }
}
