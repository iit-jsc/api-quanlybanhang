import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { CustomerRequest } from '@prisma/client'
import { BaseGateway } from './base.gateway'

@WebSocketGateway()
export class CustomerRequestGateway extends BaseGateway {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma)
  }

  async handleCreateCustomerRequest(payload: CustomerRequest) {
    this.server.to(payload.branchId).emit('customer-request', payload)
  }
}
