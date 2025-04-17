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

  async handleSendNotify(
    payload: CreateNotifyDto | CreateNotifyDto[],
    branchId: string,
    deviceId: string
  ) {
    // Đảm bảo payload luôn là một mảng
    const emitData = Array.isArray(payload) ? payload : [payload]

    const accountSocket = deviceId
      ? await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      : null

    this.server
      .to(branchId)
      .emit('notifies', emitData, accountSocket ? { except: accountSocket.socketId } : {})
  }
}
