import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { BaseGateway } from './base.gateway'
import { JwtService } from '@nestjs/jwt'
import { CreateNotifyDto } from 'src/notify/dto/notify.dto'

@WebSocketGateway()
export class NotifyGateway extends BaseGateway {
  constructor(prisma: PrismaService, jwtService: JwtService) {
    super(prisma, jwtService)
  }

  async handleSendNotify(payload: CreateNotifyDto) {
    this.server.to(payload.branchId).emit('notify', payload)
  }
}
