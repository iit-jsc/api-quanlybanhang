import { Server } from 'socket.io'
import { CreateNotifyDto } from 'src/notify/dto/notify.dto'
import { WebSocketServer } from '@nestjs/websockets'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class NotifyGatewayHandler {
  @WebSocketServer()
  private server: Server

  setServer(server: Server) {
    this.server = server
  }

  async handleSendNotify(
    payload: CreateNotifyDto | CreateNotifyDto[],
    branchId: string,
    deviceId?: string
  ) {
    // Nếu payload là mảng, sử dụng trực tiếp; nếu không, bọc trong mảng
    const emitData = Array.isArray(payload) ? payload : [payload]

    const accountSocket = deviceId
      ? await prisma.accountSocket.findUnique({ where: { deviceId } })
      : null

    this.server
      .to(branchId)
      .except(accountSocket?.socketId || '')
      .emit('notifies', emitData)
  }
}
