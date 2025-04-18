import { Server } from 'socket.io'
import { PrismaService } from 'nestjs-prisma'
import { CreateNotifyDto } from 'src/notify/dto/notify.dto'
import { WebSocketServer } from '@nestjs/websockets'

export class NotifyGatewayHandler {
  @WebSocketServer()
  private server: Server

  constructor(private readonly prisma: PrismaService) {}

  setServer(server: Server) {
    this.server = server
  }

  async handleSendNotify(
    payload: CreateNotifyDto | CreateNotifyDto[],
    branchId: string,
    deviceId?: string
  ) {
    const emitData = Array.isArray(payload) ? payload : [payload]
    const accountSocket = deviceId
      ? await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      : null

    this.server
      .to(branchId)
      .except(accountSocket?.socketId || '')
      .emit('notifies', emitData)
  }
}
