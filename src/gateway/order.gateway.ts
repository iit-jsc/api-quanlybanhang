import { Order } from '@prisma/client'
import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { BaseGateway } from './base.gateway'
@WebSocketGateway()
export class OrderGateway extends BaseGateway {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma)
  }

  async handleModifyOrder(payload: Order) {
    this.server.to(payload.branchId).emit('order', payload)
  }
}
