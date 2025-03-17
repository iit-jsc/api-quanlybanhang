import { UseGuards } from '@nestjs/common'
import { WebSocketGateway } from '@nestjs/websockets'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { PrismaService } from 'nestjs-prisma'
import { Order } from '@prisma/client'
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
