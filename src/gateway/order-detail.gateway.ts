import { OrderDetail } from '@prisma/client'
import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { BaseGateway } from './base.gateway'
import { JwtService } from '@nestjs/jwt'
@WebSocketGateway()
export class OrderDetailGateway extends BaseGateway {
  constructor(prisma: PrismaService, jwtService: JwtService) {
    super(prisma, jwtService)
  }

  async handleModifyOrderDetail(payload: OrderDetail, branchId: string) {
    this.server.to(branchId).emit('order-detail', [payload])
  }

  async handleModifyOrderDetails(payload: OrderDetail[], branchId: string) {
    this.server.to(branchId).emit('order-detail', payload)
  }
}
