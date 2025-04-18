import { Server } from 'socket.io'
import { WebSocketServer } from '@nestjs/websockets'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class TableGatewayHandler {
  @WebSocketServer()
  private server: Server

  setServer(server: Server) {
    this.server = server
  }

  private async emitTableDishEvent(
    event: string,
    payload: any,
    branchId: string,
    deviceId?: string
  ) {
    const emitData = Array.isArray(payload) ? payload : [payload]
    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await prisma.accountSocket.findUnique({
        where: { deviceId }
      })

      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit(event, emitData)
        return
      }
    }

    target.emit(event, emitData)
  }

  async handleAddDish(payload: any, branchId: string, deviceId?: string) {
    await this.emitTableDishEvent('add-dish-to-table', payload, branchId, deviceId)
  }
}
