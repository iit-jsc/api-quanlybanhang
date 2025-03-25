import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { Table } from '@prisma/client'
import { BaseGateway } from './base.gateway'

@WebSocketGateway()
export class TableGateway extends BaseGateway {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma)
  }

  async handleModifyTable(payload: Table) {
    this.server.to(payload.branchId).emit('table', payload)
  }
}
