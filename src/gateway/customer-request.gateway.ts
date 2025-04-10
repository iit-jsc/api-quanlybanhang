import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { CustomerRequest } from '@prisma/client'
import { BaseGateway } from './base.gateway'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway()
export class CustomerRequestGateway extends BaseGateway {
  constructor(prisma: PrismaService, jwtService: JwtService) {
    super(prisma, jwtService)
  }

  async handleCreateCustomerRequest(payload: CustomerRequest) {
    this.server.to(payload.branchId).emit('customer-request', payload)
  }
}
